export interface QueryParamModel {
    name: string,
    displayName?: string // Contain the display Value eg. County Name for a county filter
    value: string | number | boolean
}


export interface TableHeaderModel {
    name: string
    title: string
    visible?: boolean
    active: boolean
}

export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}

export interface TableSortModel {
    orderBy: string // Should be updated when updating the headers
    order: SortDirection // ASC or DESC
}


// Used simply as a cache for a given set of query params
export interface TableModel {
    id: string // md5 has from url and query Params 
    page: number
    headers?: TableHeaderModel[],
    next?: string
    sort?: TableSortModel
    count?: number
    prev?: string
    results?: any[]
    grouping: string,
    cacheValue?: string,

}


// Derived from the tables options.ts grouping key
export interface DataGroupingModel {
    name: string
    displayName: string // Used to display the desired grouping name. May include value from row displayField
    filterName: string // Filter name for the value field
    rowDisplayField?: string // Used to get the display value for any filter
    url: string // Tables share url but not the query Params derived from name
    selectedTable?: string // Previously active table
    valueField: string // The grouping field. Defaults to the `value` field. Hidden by default
    showAndFilterFields: string[]
    sort?: TableSortModel
    currentFilterDisplayValue?: string | number
    visibleQueryParams?: QueryParamModel[] // Will be displayed and user will interact
    hiddenQueryParams?: QueryParamModel[] // Smart params. Updated by the dynamic lib
}



export interface StatStateModel {
    name: string // Derived from the tables options.ts name
    url: string, // Base url
    selectedGrouping?: string,
    showAndFilterFields: string[] // Any other field that is not used to calculate the total stats
    groupings: DataGroupingModel[],
    time: string,
    removedShowAndFilterHeaders?: TableHeaderModel[],
    drillDownSteps: string[] // Hierachial order of the groupings by name
}

export interface TableStateModel {
    selectedGrouping?: string
    selectedTable?: string
    isLoading: boolean
    [id: string]: TableModel | string | undefined | boolean
}
