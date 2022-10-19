import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { DataGroupingModel, QueryParamModel, TableHeaderModel, TableModel, TableStateModel } from "./dy-stat-tables.models";
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { InitStatState, NextRoute, RefreshPage, SelectTable, SelectTableRow } from "./dy-stat-tables.actions";
import { getHeaderTitle } from "../stats-tables.utils";
import { tap } from "rxjs/operators";
import { StatsTableService } from "../stats-table.service";
import { Md5 } from 'ts-md5';
import { StatsTablesState } from "./dy-stat-tables.state";

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
        queryParams.forEach(param => {
            params[param.name] = param.value
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
            return ctx.dispatch(new NextRoute({ url: `/${nextGrouping.name}`, queryParams: this._getQueryParamsMap([...currentQueryParams, nextLevelQueryParam]) }))
        }

        return undefined
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
        const hideHeaders = ['id', 'value']
        const tableHash = this._getTableHash(selectedGrouping.visibleQueryParams || [])
        const table: TableModel = { id: tableHash, page: 1, grouping: selectedGrouping.name }
        ctx.patchState({ selectedTable: "", isLoading: true })

        return this.serv.getData<TableModel>(url, selectedGrouping?.visibleQueryParams || []).pipe(
            tap((result: TableModel) => {
                if (result.results?.length || 0 > 0) {
                    const row = result.results ? result.results[0] : {}
                    const newheaders = Object.keys(row).filter(h => !hideHeaders.includes(h)).map(header => {
                        return { name: header, title: getHeaderTitle(header), active: true }
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
        console.debug(`${queryParamsStr}`)
        return Md5.hashStr(queryParamsStr)
    }
}