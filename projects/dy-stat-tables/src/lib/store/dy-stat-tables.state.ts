import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { InitStatState, NextRoute, RefreshPage, SelectTable, SelectTableRow } from "./dy-stat-tables.actions";
import { DataGroupingModel, QueryParamModel, StatStateModel, TableHeaderModel, TableModel } from "./dy-stat-tables.models";
import { Md5 } from 'ts-md5';
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { StatsTableService } from "../stats-table.service";
import { getHeaderTitle } from "../stats-tables.utils";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";

const defaultState = {
    url: "",
    name: "None Selected",
    drillDownSteps: [],
    groupings: [],
    time: "Not set",
    showAndFilterFields: []
}
@State<StatStateModel>({
    name: 'stats_tables',
    defaults: defaultState
})
@Injectable()
export class StatsTablesState {
    constructor(private serv: StatsTableService, private router: Router) { }

    @Selector()
    static results(state: StatStateModel) {
        return this.table(state)?.results
    }

    @Selector()
    static time(state: StatStateModel) {
        return state.time
    }

    @Selector()
    static page(state: StatStateModel) {
        return this.table(state)?.page
    }

    @Selector()
    static queryParams(state: StatStateModel) {
        return state.groupings.find(gr => gr.name == state.selectedGrouping)?.visibleQueryParams
    }

    @Selector()
    static pageSize(state: StatStateModel) {
        return this.table(state)?.results?.length || 0
    }

    @Selector()
    static headers(state: StatStateModel) {
        return this.table(state)?.headers
    }

    @Selector()
    static activeHeaders(state: StatStateModel) {
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (currentGrouping) {
            console.log("Filtering headers...")
            return this.table(state)?.headers?.filter(h => currentGrouping.showAndFilterFields.includes(h.name))
        }
        return this.table(state)?.headers
    }

    @Selector()
    static hasData(state: StatStateModel): boolean {
        return this.table(state)?.count != 0;
    }

    @Selector()
    static drillDownSteps(state: StatStateModel): string[] {
        return state.groupings.map(gr => getHeaderTitle(gr.name));
    }

    @Selector()
    static showAndFilterFields(state: StatStateModel): string[] {
        return state.groupings.find(gr => gr.name == state?.selectedGrouping)?.showAndFilterFields || [];
    }

    @Selector()
    static activeGroupings(state: StatStateModel): DataGroupingModel[] {
        const currentGrouping = state.selectedGrouping
        return currentGrouping ? state.groupings.slice(0, state.groupings.map(gr => gr.name).indexOf(currentGrouping) + 1) : [];
    }

    @Selector()
    static table(state: StatStateModel) {
        const grouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (grouping) {
            return grouping.tables.find(tb => tb.id == grouping.selectedTable)
        }
        return undefined
    }

    private _getSelectedGroupingTable(state: StatStateModel): TableModel | undefined {
        const grouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (grouping) {
            return grouping.tables.find(tb => tb.id == grouping.selectedTable)
        }
        return undefined
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
        console.log(params)
        return params
    }



    @Action(SelectTableRow)
    selectTableRow(ctx: StateContext<StatStateModel>, { payload }: SelectTableRow) {
        const state = ctx.getState()
        const header: TableHeaderModel = payload.header
        const row = payload.row
        const value = this._getRowValue(row, header)
        const queryParamValue = this._getRowValue(row, 'value')
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        const nextGrouping = this._getNextGrouping(state)
        console.log(header.name, value, queryParamValue)

        if (nextGrouping && currentGrouping) {
            const queryParamDisplayValue = this._getRowValue(row, currentGrouping.displayName)
            const currentQueryParams = currentGrouping.visibleQueryParams?.slice() || []
            const nextLevelQueryParam: QueryParamModel = { name: currentGrouping.filterName, displayName: queryParamDisplayValue, value: queryParamValue }
            currentGrouping.currentFilterDisplayValue = queryParamDisplayValue

            return ctx.dispatch(new NextRoute({ url: `/${nextGrouping.name}`, queryParams: this._getQueryParamsMap([...currentQueryParams, nextLevelQueryParam]) }))
        }
        // this.router.navigate([], { queryParams: )
        return undefined
    }


    private _getNextGrouping(state: StatStateModel): DataGroupingModel | undefined {
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (currentGrouping) {
            const currentIndex = state.groupings.map(gr => gr.name).indexOf(state.selectedGrouping || "")
            const nextIndex = currentIndex + 1
            return state.groupings[nextIndex]
        }
        return undefined
    }



    @Action(InitStatState)
    initState(ctx: StateContext<StatStateModel>, { payload }: InitStatState) {
        const state = ctx.getState()
        const queryParams = payload.queryParams
        const groupings = payload.groupings
        if (!groupings.map(g => g.name).includes(payload.selectedGrouping)) {
            throw new Error(`${payload.selectedGrouping} Not found. Availble Options ${groupings.map(g => g.name).join(", ")}`);
        }
        if (state.selectedGrouping) {
            // if selected grouping
            const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
            const currentVisibleParams = currentGrouping?.visibleQueryParams?.slice() || []
            const hiddenVisibleParams = currentGrouping?.hiddenQueryParams?.slice() || []
            // const newGro
            const newQueryParams = [...hiddenVisibleParams, ...queryParams]
            const newGrouping = state.groupings.find(gr => gr.name == payload.selectedGrouping)
            if (newGrouping) {
                newGrouping.visibleQueryParams = newQueryParams
                ctx.setState(patch<StatStateModel>({
                    selectedGrouping: payload.selectedGrouping,
                    groupings: updateItem<DataGroupingModel>(gr => gr?.name == newGrouping?.name, newGrouping)
                }))

            } else {
                throw new Error("Failed to setup new grouping")
            }
            console.debug("Done intit..")
            // return ctx.dispatch(new SelectTable())

        } else {
            // Else Set grouping zero and set new queryParams
            // Set the groupings
            // Set the selected group
            const groupingOne = groupings.find(gr => gr.name == payload.selectedGrouping)
            if (groupingOne) {
                groupingOne.visibleQueryParams = queryParams
                ctx.setState({
                    ...state,
                    showAndFilterFields: payload.showAndFilterFields,
                    selectedGrouping: payload.selectedGrouping,
                    groupings: groupings,
                })
                console.debug("Done intit..")
            } else {
                throw new Error("Failed to setup new grouping")
            }
            // return ctx.dispatch(new SelectTable())
        }
        console.debug("Selecting table.")
        // Send Select group
        // setTimeout(() => {
        ctx.dispatch(new SelectTable())
        // }, 100)
    }

    @Action(SelectTable)
    selectTable(ctx: StateContext<StatStateModel>, action: SelectTable) {
        // If no selected grouping throw error
        const state = ctx.getState()
        if (!state.selectedGrouping) {
            throw new Error('Init State must be called before select Table')
        }
        // Calculate the table hash from the query params 
        const selectedGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (selectedGrouping) {
            // Md5.hashStr('blah blah blah')
            const tableHash = this._getTableHash(selectedGrouping.visibleQueryParams || [])
            console.debug(`Table Hash`, tableHash)
            const selectedTable = selectedGrouping.tables.find(tb => tb.id == tableHash)
            // if (selectedTable) {
            //     // Do nothing
            //     selectedGrouping.selectedTable = tableHash
            //     ctx.setState(patch<StatStateModel>({
            //         groupings: updateItem<DataGroupingModel>(grp => grp?.name == selectedGrouping.name, selectedGrouping)
            //     }))
            // } else {
            return ctx.dispatch(new RefreshPage())
            // }
        }
        // return null
        // setTimeout(() => {
        // ctx.dispatch(new RefreshPage())
        // }, 1000)
        return null

    }

    @Action(RefreshPage)
    refreshPage(ctx: StateContext<StatStateModel>, action: SelectTable) {
        const state = ctx.getState()
        const selectedGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (!selectedGrouping)
            return
        return this._getData(ctx, selectedGrouping)
    }


    private _getData(ctx: StateContext<StatStateModel>, selectedGrouping: DataGroupingModel) {
        const url = selectedGrouping.url
        const tableHash = this._getTableHash(selectedGrouping.visibleQueryParams || [])
        const table: TableModel = { id: tableHash, page: 1, grouping: selectedGrouping.name }
        return this.serv.getData<TableModel>(url, selectedGrouping?.visibleQueryParams || []).pipe(
            tap((result: TableModel) => {
                if (result.results?.length || 0 > 0) {
                    const row = result.results ? result.results[0] : {}
                    const newheaders = Object.keys(row).map(header => {
                        return { name: header, title: getHeaderTitle(header), active: true }
                    })

                    if (table.headers == undefined) {
                        table.headers = newheaders
                    } else {
                        console.log("Found headers")
                        console.log(newheaders)
                    }
                }
                selectedGrouping.selectedTable = tableHash
                selectedGrouping.tables = [{ ...table, ...result }]
                ctx.setState(patch<StatStateModel>({
                    time: new Date().toLocaleString(),
                    groupings: updateItem<DataGroupingModel>(grp => grp?.name == selectedGrouping.name, selectedGrouping)
                }))
            })
        );
    }

    private _getTableHash(queryParams: QueryParamModel[]) {
        const queryParamsStr = JSON.stringify(queryParams.map(q => `${q.name}=${q.value}`).join("&"))
        console.debug(`${queryParamsStr}`)
        return Md5.hashStr(queryParamsStr)
    }



}
