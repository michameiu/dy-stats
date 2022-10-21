import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { GoToGrouping, InitStatState, NextRoute, RefreshPage, SelectSort, SelectTable, SelectTableRow, UpdateRowDisplayValue } from "./dy-stat-tables.actions";
import { DataGroupingModel, QueryParamModel, StatStateModel, TableHeaderModel, TableModel } from "./dy-stat-tables.models";
import { compose, updateItem, iif, insertItem, patch } from '@ngxs/store/operators';
import { StatsTableService } from "../stats-table.service";
import { getHeaderTitle } from "../stats-tables.utils";
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
    constructor(private serv: StatsTableService) { }

    @Selector()
    static selectedGrouping(state: StatStateModel): DataGroupingModel | undefined {
        return state.groupings.find(gr => gr.name == state.selectedGrouping)
    }

    @Selector()
    static sort(state: StatStateModel) {
        const selectedGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (selectedGrouping) {
            return selectedGrouping.sort
        }
        return undefined
    }

    @Selector()
    static nextGrouping(state: StatStateModel) {
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (currentGrouping) {
            const currentIndex = state.groupings.map(gr => gr.name).indexOf(state.selectedGrouping || "")
            const nextIndex = currentIndex + 1
            return state.groupings[nextIndex]
        }
        return undefined
    }
    @Selector()
    static prevGrouping(state: StatStateModel) {
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (currentGrouping) {
            const currentIndex = state.groupings.map(gr => gr.name).indexOf(state.selectedGrouping || "")
            const nextIndex = currentIndex - 1
            return state.groupings[nextIndex]
        }
        return undefined
    }

    @Selector()
    static groupings(state: StatStateModel) {
        return state.groupings
    }

    @Selector()
    static time(state: StatStateModel) {
        return state.time
    }

    @Selector()
    static drillDownSteps(state: StatStateModel): string[] {
        return state.groupings.map(gr => getHeaderTitle(gr.name));
    }

    @Selector()
    static onlyAndFilterFields(state: StatStateModel): TableHeaderModel[] {
        const selectedGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (selectedGrouping) {
            return selectedGrouping.showAndFilterFields.map(h => ({
                name: h,
                active: true,
                title: getHeaderTitle(h)
            }));
        }
        return []
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
        return undefined
    }

    @Action(UpdateRowDisplayValue)
    updateRowDisplayValue(ctx: StateContext<StatStateModel>, { payload }: UpdateRowDisplayValue) {
        const state = ctx.getState()
        const grouping = state.groupings.find(gr => gr.name == payload.groupingId)
        if (!grouping) return
        grouping.currentFilterDisplayValue = payload.value
        // console.log(grouping, payload.value)
        ctx.setState(patch<StatStateModel>({
            time: new Date().toLocaleString(),
            groupings: updateItem<DataGroupingModel>(gr => gr?.name == grouping?.name, grouping)
        }))
    }

    @Action(SelectSort)
    selectSort(ctx: StateContext<StatStateModel>, { payload }: SelectSort) {
        const state = ctx.getState()
        const currentGrouping = state.groupings.find(gr => gr.name == state.selectedGrouping)
        if (currentGrouping) {
            currentGrouping.sort = payload.orderBy != "" ? payload : undefined
            ctx.setState(patch<StatStateModel>({
                time: new Date().toLocaleString(),
                groupings: updateItem<DataGroupingModel>(gr => gr?.name == currentGrouping?.name, currentGrouping)
            }))
        }
        return ctx.dispatch(new RefreshPage())
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
        } else {
            // Else Set grouping zero and set new queryParams
            // Set the groupings
            // Set the selected group
            const groupingOne = groupings.find(gr => gr.name == payload.selectedGrouping)
            if (groupingOne) {
                groupingOne.visibleQueryParams = queryParams
                ctx.setState({
                    ...state,
                    time: new Date().toLocaleString(),
                    showAndFilterFields: payload.showAndFilterFields,
                    selectedGrouping: payload.selectedGrouping,
                    groupings: groupings,
                })
            } else {
                throw new Error("Failed to setup new grouping")
            }
        }
        return ctx.dispatch(new SelectTable())
    }



}
