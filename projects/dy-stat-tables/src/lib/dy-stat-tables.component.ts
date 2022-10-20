import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, ofActionCompleted, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { InitStatState, NextRoute, SelectTableRow } from './store/dy-stat-tables.actions';
import { filterOptions } from './options'
import { DataGroupingModel, QueryParamModel, SortDirection, TableHeaderModel } from './store/dy-stat-tables.models';
import { StatsTablesState } from './store/dy-stat-tables.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';
import { TablesState } from './store/dy-stat-grouping.state';
const showAndFilterFields = ['present_males', 'present_females', 'absent_males', 'absent_females']
const attendanceGroupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/attendances/${choice.value}`,
    valueField: "",
    tables: [],
    // sort: {
    //   orderBy: 'total_attendances_taken',
    //   order: SortDirection.ASC
    // },
    showAndFilterFields: choice.only_and_filter_fields ? choice.only_and_filter_fields : showAndFilterFields,
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))

const enrollmentGroupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/students/${choice.value}`,
    valueField: "",
    tables: [],
    showAndFilterFields: choice.only_and_filter_fields ? choice.only_and_filter_field : ['males', 'females'],
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))

const currentGrouping = attendanceGroupings


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
  @Select(TablesState.isLoading) isLoading$!: Observable<boolean>;
  @Select(StatsTablesState.drillDownSteps) drillDownSteps$!: Observable<string[]>;
  @Select(TablesState.currentTable) currentTable$!: Observable<any>;

  canShowNumbering: boolean = true
  name: string = "Students Stats"
  loading: boolean = false
  dummyData: any = ["", "", "", "", "", "", "", "", ""]
  groupingId: string = ""
  queryParams: any
  subscription?: Subscription
  routeSub?: Subscription
  queryParamSub?: Subscription
  constructor(private store: Store, private actions$: Actions, private activatedRoute: ActivatedRoute, private router: Router) { }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.routeSub?.unsubscribe()
    this.queryParamSub?.unsubscribe()
  }

  ngOnInit(): void {
    // Pass all the queryParams through the router. To support server side rendering
    // If a filter is updated navigate to the same url with different query param
    // Updating of the query param should not be a replace. 
    // Should check if value macthes before keeping the display name
    this.subscription = this.actions$.
      pipe(ofActionSuccessful(NextRoute)).subscribe(res => {
        console.log("Results are")
        console.log(res)
        const payload = res.payload
        this.router.navigate([`/${payload.url}/`], { queryParams: payload.queryParams })

      })
    this.queryParamSub = this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params || {}
    });
    // console.log("Something is wrong...")
    this.routeSub = this.activatedRoute.paramMap.subscribe(params => {
      let queryParams: QueryParamModel[] = []

      this.groupingId = params.get("routing") || ""
      // console.log(this.groupingId)
      //Set the table and refresh & Check if any

      if (!this.groupingId) {
        console.log("No grouping id")
        this.router.navigate([`/${attendanceGroupings[0].name}/`], { queryParams: this.queryParams })
        return
      }
      for (let key in this.queryParams) {
        const value = this.queryParams[key]
        if (typeof value == "object" && Array.isArray(value)) {
          queryParams = [...queryParams, ...value.map(v => ({ name: key, value: v }))]
        } else {
          queryParams.push({ name: key, value: value })

        }
      }
      // console.log(queryParams)
      //Set the table and refresh & Check if any
      this.store.dispatch(new InitStatState({ groupings: currentGrouping, queryParams: queryParams, selectedGrouping: this.groupingId, showAndFilterFields: showAndFilterFields }))
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
    this.store.dispatch(new Navigate(['/admin']))
  }

}
