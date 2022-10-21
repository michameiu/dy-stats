import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { DataGroupingModel, QueryParamModel, TableHeaderModel, TableModel, TableStateModel } from "./dy-stat-tables.models";
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { InitStatState, NextRoute, RefreshPage, SelectTable, SelectTableRow, UpdateColumn } from "./dy-stat-tables.actions";
import { getHeaderTitle } from "../stats-tables.utils";
import { concatMap, map, mergeMap, tap } from "rxjs/operators";
import { StatsTableService } from "../stats-table.service";
import { Md5 } from 'ts-md5';
import { StatsTablesState } from "./dy-stat-tables.state";
import { Observable } from "rxjs";

const SHOW_AND_FILTER_FIELD_NAME = 'only_and_filter_field'
const defaultState = {
    isLoading: false
}

@State<TableStateModel>({
    name: 'table_stats',
    defaults: defaultState
})

@Injectable()
export class TablesState {

    constructor(private serv: StatsTableService, private store: Store) { }

    @Selector()
    static selectedTableHash(state: TableStateModel) {
        return state.selectedTable
    }

    @Selector()
    static currentTable(state: TableStateModel) {
        return state[state.selectedTable || ""]
    }

    @Selector()
    static isLoading(state: TableStateModel) {
        return state.isLoading
    }

    @Selector()
    static results(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        return table?.results
    }

    @Selector()
    static headers(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        return table?.headers
    }

    @Selector()
    static isHeaderActive(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        const visibleHeaders = new Set(table?.headers?.filter(h => h.visible).map(h => h.name))
        return (header: TableHeaderModel) => visibleHeaders.has(header.name)
    }




    @Selector([TablesState.currentTable, StatsTablesState.selectedGrouping])
    static queryParams(table: TableModel, selectedGrouping: DataGroupingModel) {
        return selectedGrouping.visibleQueryParams
    }



    @Selector()
    static page(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        return table?.page
    }

    @Selector()
    static hasData(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        return (table?.results?.length || 0) > 0
    }

    @Selector()
    static pageSize(state: TableStateModel) {
        let table = state[state.selectedTable || ""] as TableModel | undefined
        return table?.results?.length
    }





    @Action(InitStatState)
    initState(ctx: StateContext<TableStateModel>, { payload }: InitStatState) {
        ctx.patchState({
            selectedGrouping: payload.selectedGrouping
        })
    }
    private _getSelectedGrouping() {
        return this.store.selectSnapshot(StatsTablesState.selectedGrouping);
    }

    @Action(SelectTable)
    selectTable(ctx: StateContext<TableStateModel>, action: SelectTable) {
        // If no selected grouping throw error
        const state = ctx.getState()
        if (!state.selectedGrouping) {
            throw new Error('Init State must be called before select Table')
        }
        // Calculate the table hash from the query params 
        const selectedGrouping = this._getSelectedGrouping()
        if (selectedGrouping) {
            // Md5.hashStr('blah blah blah')
            const tableHash = this._getTableHash(selectedGrouping.visibleQueryParams || [])
            console.debug(`Table Hash`, tableHash)
            const selectedTable = state.selectedTable
            ctx.dispatch(new RefreshPage())
            return null
        }
        return null
    }

    private _getRowValue(row: any, header: TableHeaderModel | string) {
        if (typeof header == "string") {
            return row[header]
        }
        return row[header.name]
    }

    private _getQueryParamsMap(queryParams: QueryParamModel[]): any {
        const params: any = {}
        queryParams.slice().forEach(param => {
            const value = queryParams.filter(h => h.name == param.name).map(h => h.value)
            params[param.name] = value.length == 1 ? value[0] : value
        })
        return params
    }

    private _getNextGrouping(state: TableStateModel): DataGroupingModel | undefined {
        return this.store.selectSnapshot(StatsTablesState.nextGrouping);
    }

    @Action(SelectTableRow)
    selectTableRow(ctx: StateContext<TableStateModel>, { payload }: SelectTableRow) {
        const state = ctx.getState()
        const header: TableHeaderModel = payload.header
        const row = payload.row
        const value = this._getRowValue(row, header)
        const queryParamValue = this._getRowValue(row, 'value')
        const currentGrouping = this._getSelectedGrouping()
        const nextGrouping = this._getNextGrouping(state)


        if (nextGrouping && currentGrouping) {
            const queryParamDisplayValue = this._getRowValue(row, currentGrouping.displayName)
            const currentQueryParams = currentGrouping.visibleQueryParams?.slice() || []
            const nextLevelQueryParam: QueryParamModel = { name: currentGrouping.filterName, displayName: queryParamDisplayValue, value: queryParamValue }
            currentGrouping.currentFilterDisplayValue = queryParamDisplayValue
            const newheaders = this._appendShowAndOnlyParams(header, [...currentQueryParams, nextLevelQueryParam])
            return ctx.dispatch(new NextRoute({ url: `/${nextGrouping.name}`, queryParams: this._getQueryParamsMap(newheaders) }))

        }

        return undefined
    }

    private _getCurrentTableHeaders() {
        return this.store.selectSnapshot(TablesState.headers);
    }

    @Action(UpdateColumn)
    updateColumn(ctx: StateContext<TableStateModel>, { payload }: UpdateColumn) {
        const state = ctx.getState()
        const currentGrouping = this._getSelectedGrouping()
        const header = payload.header
        const isAShowOnlyField = currentGrouping?.showAndFilterFields.includes(header.name)
        const currentHeaders = new Set(this._getCurrentTableHeaders()?.map(h => h.name))
        // If it's not a onlyAndFilterField Ignore
        if (!isAShowOnlyField) return
        if (!currentGrouping) return

        // Compare the current headers to the showOnly Headers

        const allOnlyFiterFieldsPresent = currentGrouping?.showAndFilterFields.every(header => currentHeaders.has(header))
        console.log(`Has every headr ${allOnlyFiterFieldsPresent}`)
        // If already an inactive header, remove or append the header and refresh
        if (allOnlyFiterFieldsPresent) {
            // If header is inactive
            // Create a showAndFilterQueryFor the other fields 
            const newHeaders: QueryParamModel[] = currentGrouping.showAndFilterFields.filter(h => h != header.name).map(h => ({
                name: SHOW_AND_FILTER_FIELD_NAME,
                value: h
            }))
            currentGrouping.hiddenQueryParams?.concat(newHeaders)
        } else {
            // Remove or add accordingly
            if (header.active) {
                currentGrouping?.visibleQueryParams?.push({ name: SHOW_AND_FILTER_FIELD_NAME, value: header.name })
            } else {
                currentGrouping.visibleQueryParams = currentGrouping.visibleQueryParams?.filter(q => !(q.value == header.name))
            }
        }
        return ctx.dispatch(new NextRoute({ url: `/${currentGrouping?.name}`, queryParams: this._getQueryParamsMap(currentGrouping?.visibleQueryParams || []) }))
            .pipe(mergeMap(res => ctx.dispatch(new RefreshPage())))
    }

    private _appendShowAndOnlyParams(header: TableHeaderModel, queryParams: QueryParamModel[]): QueryParamModel[] {
        const currentGrouping = this._getSelectedGrouping()
        const isAShowOnlyField = currentGrouping?.showAndFilterFields.includes(header.name)
        console.log(`Clicked a isSHowONlyField ${header.name} ${isAShowOnlyField}`)
        if (!isAShowOnlyField) return queryParams
        queryParams = queryParams.filter(q => q.name != SHOW_AND_FILTER_FIELD_NAME)
        queryParams.push({ name: SHOW_AND_FILTER_FIELD_NAME, value: header.name })
        console.log(queryParams)
        return queryParams
    }

    @Action(RefreshPage)
    refreshPage(ctx: StateContext<TableStateModel>, action: SelectTable) {
        const selectedGrouping = this._getSelectedGrouping()
        if (!selectedGrouping)
            return
        return this._getData(ctx, selectedGrouping)
    }


    private _getData(ctx: StateContext<TableStateModel>, selectedGrouping: DataGroupingModel) {
        const url = selectedGrouping.url
        const state = ctx.getState()
        const currentGrouping = this._getSelectedGrouping()
        const hideHeaders = ['id', 'value']
        const tableHash = this._getTableHash(selectedGrouping.visibleQueryParams || [])
        const table: TableModel = { id: tableHash, page: 1, grouping: selectedGrouping.name }
        ctx.patchState({ selectedTable: "", isLoading: true })

        const allHeaders = selectedGrouping?.visibleQueryParams?.slice() || []
        if (selectedGrouping.sort) {
            allHeaders.push({ name: 'order_by', value: selectedGrouping.sort.orderBy })
            allHeaders.push({ name: 'order', value: selectedGrouping.sort.order })
        }

        return this.serv.getData<TableModel>(url, allHeaders).pipe(
            tap((result: TableModel) => {
                if (result.results?.length || 0 > 0) {
                    const row = result.results ? result.results[0] : {}
                    const newheaders = Object.keys(row).filter(h => !hideHeaders.includes(h)).map(header => {
                        return {
                            name: header,
                            title: getHeaderTitle(header),
                            active: true,
                            visible: currentGrouping?.showAndFilterFields.includes(header)
                        }
                    })

                    if (table.headers == undefined) {
                        table.headers = newheaders
                    } else {
                        console.log("Found headers")
                        console.log(newheaders)
                    }
                    ctx.patchState({
                        isLoading: false,
                        selectedTable: tableHash,
                        [tableHash]: {
                            ...table,
                            ...result
                        }
                    })
                } else {
                    ctx.patchState({
                        isLoading: false,
                        selectedTable: tableHash,
                    })
                }
            }, error => {
                ctx.patchState({
                    isLoading: false,
                })
            })
        );
    }

    private _getTableHash(queryParams: QueryParamModel[]) {
        const queryParamsStr = JSON.stringify(queryParams.map(q => `${q.name}=${q.value}`).join("&"))
        // console.debug(`${queryParamsStr}`)
        return Md5.hashStr(queryParamsStr)
    }
}