
import { Predicate } from '@ngxs/store/operators/internals';
import { StateOperator } from '@ngxs/store';
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { TableHeaderModel } from '../public-api';

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

