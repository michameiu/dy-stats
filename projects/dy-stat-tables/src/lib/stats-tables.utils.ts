
import { Predicate } from '@ngxs/store/operators/internals';
import { StateOperator } from '@ngxs/store';
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { QueryParamModel, TableHeaderModel } from '../public-api';

import { ModuleWithProviders, NgModule, Type } from '@angular/core';
export function utilsConfigureLazyModule<T>(moduleWithProviders: ModuleWithProviders<T>): Type<T> {
    const { ngModule, providers } = moduleWithProviders;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore todo: https://stackoverflow.com/a/59687799/2331113
    const injections: NgModule = ngModule['ɵinj'];
    if (injections && providers) {
        injections.providers?.push(...providers)
    }
    return ngModule;
}

export function getHeaderTitle(header: string | TableHeaderModel) {
    let name = ""
    if (typeof header == "string") {
        name = header
    } else {
        name = header.name
    }
    return toTitleCase(name)
}

export function toTitleCase(str: string) {
    return str.replace(/_/g, " ").toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}
export function urlQueryParamsToQueryParamModel(data: any): QueryParamModel[] {
    let queryParams: QueryParamModel[] = []

    for (let key in data) {
        const value = data[key]
        if (typeof value == "object" && Array.isArray(value)) {
            queryParams = [...queryParams, ...value.map(v => ({ name: key, value: v }))]
        } else {
            queryParams.push({ name: key, value: value })
        }
    }

    return queryParams
}

export function parseFilters(data: any) {
    let ignoreFiltersForDecription = ["report_type", "grouping", "paginator"]
    let descriptions = []

    let parsedFilters: any = {}
    for (let key in data) {
        const filterValue = data[key]
        if (!filterValue) continue
        if (typeof filterValue == "object") {
            if (filterValue.hasOwnProperty("value")) {
                parsedFilters[key] = filterValue.value
            }
            if (filterValue.hasOwnProperty("details")) {
                for (let index in filterValue.details) {
                    const description = filterValue.details[index]
                    if (description.hasOwnProperty("description")) {
                        if (!ignoreFiltersForDecription.includes(key))
                            descriptions.push(description.description)
                    }
                }
            }
        } else {
            parsedFilters[key] = filterValue
            if (!ignoreFiltersForDecription.includes(key))
                descriptions.push(`${key}*${filterValue}`)
        }
    }


    return { filters: parsedFilters, descriptions: descriptions }
}

