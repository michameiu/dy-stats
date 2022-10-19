import { DataGroupingModel, QueryParamModel, SortDirection, StatStateModel, TableHeaderModel } from "./dy-stat-tables.models";


export class InitStatState {
    static readonly type = '[StatsTable] InitState Grouping';
    constructor(public payload: { groupings: DataGroupingModel[], selectedGrouping: string, queryParams: QueryParamModel[], showAndFilterFields: string[] }) { }
}

// Selecting a data group
export class SelectDataGrouping {
    // Make sure init is done
    // Update selected grouping in state
    // Update the query params by patching 
    // Factor in `only_and_filter_field` query params behaviour should require headers update if hash not same
    // Get all the query Params found and construct a hash 
    // Update the grouping selected table(hash)
    // Trigger Selecting of the table by hash
    static readonly type = '[StatsTable] Select State Grouping';
    constructor(public payload: { grouping: string, queryParams: QueryParamModel }) { }
}

export class SelectSort {
    static readonly type = '[StatsTable] Update Sort';
    constructor(public payload: { field: string, order: SortDirection }) { }
}


export class SelectTable {
    // Get the selected grouping from state
    // Get the selected table(hash) from grouping
    // Check if the table exists or define one
    // Trigger Refreshing of the table data
    static readonly type = '[StatsTable] Select Grouping Table ';
    constructor() { }
}

export class NextRoute {
    static readonly type = '[StatsTable] Select Next Route ';
    constructor(public payload: { url: string, queryParams: any }) { }

}

export class SelectTableRow {
    static readonly type = '[StatsTable] Select Table Row';
    constructor(public payload: { header: TableHeaderModel, row: any }) {

    }

}
export class RefreshPage {
    // Get the selected grouping from state
    // Get the selected table(hash) from grouping
    // Check if the table has any results
    // If it has do nothing as results have already updated else update the return fetch obaservable
    // If the headers are empty update them
    static readonly type = '[StatsTable] Refresh Table Page';
    constructor() { }
}

export class UpdateColumn {
    // Get the selected grouping from state
    // Get the selected table(hash) from grouping
    // Get the selected table
    // Update the header 
    // If header is not visible add to removed headers
    // if visible remove from removed headers
    // Remove all the showAndFilterFields query Params params
    // Recreate for  Query Params with showAndFilterFields fields for only the visible ones 
    // Only header that are showAndFilterFields  should be toggable :)
    // clear current headers and trigger refresh
    static readonly type = "[StatsTable] Update Single Columns"
    constructor(public payload: { header: TableHeaderModel }) { }
}

export class SelectSignleColumn {
    // Get the selected grouping from state
    // Get the selected table(hash) from grouping
    // Get the selected table
    // Remove all the showAndFilterFields query Params params
    // Add showAndFilterFields Query Param for this field only the visible ones 
    // Add all the showAndFilterFields to removed removedHeaders
    // Only header that are showAndFilterFields  should be toggable :)
    // clear current headers and trigger refresh
    static readonly type = "[StatsTable] Update Single Columns"
    constructor(public payload: { header: TableHeaderModel }) { }
}




