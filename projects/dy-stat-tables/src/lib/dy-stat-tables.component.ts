import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, ofActionCompleted, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { InitStatState, NextRoute, SelectTableRow, TriggerExport } from './store/dy-stat-tables.actions';
import { filterOptions } from './options'
import { DataGroupingModel, QueryParamModel, SortDirection, TableHeaderModel } from './store/dy-stat-tables.models';
import { StatsTablesState } from './store/dy-stat-tables.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';
import { TablesState } from './store/dy-stat-grouping.state';
import { Logout } from '@sisitech/ngxs-auth';
import { getHeaderTitle, parseFilters, urlQueryParamsToQueryParamModel } from './stats-tables.utils';
@Component({
  selector: 'sistch-dy-stat-tables',
  templateUrl: 'dy-stat-tables.component.html',
  styles: [
    `
    .linear-background {
            position: relative;
            overflow: hidden;
            display: block;
            animation-duration: 1s;
            animation-fill-mode: forwards;
            animation-iteration-count: infinite;
            animation-name: placeHolderShimmer;
            animation-timing-function: linear;
            background: #f6f7f8;
            background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
            background-size: 1000px 10px;
            height: 30px;
            border-radius: 3px;
        }
    
    `
  ]
})
export class DyStatTablesComponent implements OnInit, OnDestroy {

  @Select(TablesState.headers) tableHeaders$!: Observable<TableHeaderModel[]>;
  @Select(TablesState.results) results$!: Observable<any[]>;
  @Select(TablesState.pageSize) pageSize$!: Observable<number>;
  @Select(TablesState.page) page$!: Observable<number>;
  @Select(StatsTablesState.time) time$!: Observable<string>;
  @Select(StatsTablesState.showAndFilterFields) showAndFilterFields$!: Observable<string[]>;
  @Select(TablesState.hasData) hasData$!: Observable<boolean>;
  @Select(TablesState.canExport) canExport$!: Observable<boolean>;
  @Select(TablesState.isExporting) isExporting$!: Observable<boolean>;
  @Select(TablesState.isLoading) isLoading$!: Observable<boolean>;
  @Select(StatsTablesState.drillDownSteps) drillDownSteps$!: Observable<string[]>;
  @Select(TablesState.currentTable) currentTable$!: Observable<any>;

  canShowNumbering: boolean = true
  name: string = "Students Stats"
  loading: boolean = false
  dummyData: any = ["", "", "", "", "", "", "", "", ""]
  groupingId: string = ""
  queryParams: any
  isValidationOnly = true
  subscription?: Subscription
  routeSub?: Subscription
  queryParamSub?: Subscription
  filterParams: QueryParamModel[] = []
  constructor(private store: Store,
    private actions$: Actions,
    @Inject('groupings') private groupings: DataGroupingModel[],
    @Inject('myformConfig') private myformConfig: any,
    @Inject('filterOptions') public filterOptions: any,
    @Inject('formGroupOrder') public formGroupOrder: any,
    private activatedRoute: ActivatedRoute, private router: Router) {
    console.log(myformConfig, this.filterOptions)
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.routeSub?.unsubscribe()
    this.queryParamSub?.unsubscribe()
  }
  export() {
    this.store.dispatch(new TriggerExport())
  }
  onValidatedData(data: any) {
    console.log(data)
    const { filters, descriptions } = parseFilters(data)
    // console.log(filters)
    this.filterParams = urlQueryParamsToQueryParamModel(filters)
    this.ngOnInit()
  }

  getBasePathNames(): string[] {
    const parsedUrl = new URL(window.location.href);
    const pathNames = parsedUrl.pathname.split("/").filter(n => n != "")
    // console.log("Before", pathNames)
    const last = pathNames.pop()
    if (last && !this.groupings.map(g => g.name).includes(last)) {
      pathNames.push(last)
    }
    console.log("After", pathNames)
    if (pathNames.length > 0)
      this.name = `${getHeaderTitle(pathNames[pathNames.length - 1])} Stats`
    return pathNames
  }

  ngOnInit(): void {
    // Pass all the queryParams through the router. To support server side rendering
    // If a filter is updated navigate to the same url with different query param
    // Updating of the query param should not be a replace. 
    // Should check if value macthes before keeping the display name
    this.getBasePathNames()
    this.subscription = this.actions$.
      pipe(ofActionSuccessful(NextRoute)).subscribe(res => {
        // console.log("Results are")
        // console.log(res)
        this.getBasePathNames()

        const payload = res.payload
        const parts = [...this.getBasePathNames(), `${payload.url}`].map(url => url.replace(/\//g, ""))
        this.router.navigate(parts, { queryParams: payload.queryParams })
      })

    this.queryParamSub = this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params || {}
    });
    // console.log("Something is wrong...")
    this.routeSub = this.activatedRoute.paramMap.subscribe(params => {

      this.groupingId = params.get("routing") || ""
      //Set the table and refresh & Check if any

      if (!this.groupingId) {
        // console.log("No grouping id")
        // console.log(this.groupings)
        // console.log(this.getBasePathNames())
        this.router.navigate([...this.getBasePathNames(), `${this.groupings[0].name}`], { queryParams: this.queryParams })
        return
      }
      let queryParams: QueryParamModel[] = urlQueryParamsToQueryParamModel(this.queryParams)

      // console.log(queryParams)
      //Set the table and refresh & Check if any
      this.store.dispatch(new InitStatState({ groupings: this.groupings, queryParams: [...queryParams, ...this.filterParams], selectedGrouping: this.groupingId, showAndFilterFields: [] }))
    });


  }
  getRowValue(row: any, header: TableHeaderModel | string) {
    if (typeof header == "string") {
      return row[header]
    }
    return row[header.name]
  }

  drillDown(row: any, header: TableHeaderModel) {
    // console.log(header, row)
    this.store.dispatch(new SelectTableRow({ header: header, row: row }))
  }

  onClick() {
    this.store.dispatch(new Logout())
  }

}
