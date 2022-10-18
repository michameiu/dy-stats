import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, ofActionCompleted, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { InitStatState, NextRoute, SelectTableRow } from './store/dy-stat-tables.actions';
import { filterOptions } from './options'
import { DataGroupingModel, QueryParamModel, TableHeaderModel } from './store/dy-stat-tables.models';
import { StatsTablesState } from './store/dy-stat-tables.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';
const showAndFilterFields = ['present_males', 'present_females', 'absent_males', 'absent_females']
const groupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/attendances/${choice.value}`,
    valueField: "",
    tables: [],
    showAndFilterFields: showAndFilterFields,
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))


@Component({
  selector: 'sistch-dy-stat-tables',
  templateUrl: 'dy-stat-tables.component.html',
  styles: [
  ]
})
export class DyStatTablesComponent implements OnInit, OnDestroy {

  @Select(StatsTablesState.headers) tableHeaders$!: Observable<TableHeaderModel[]>;
  @Select(StatsTablesState.results) results$!: Observable<any[]>;
  @Select(StatsTablesState.pageSize) pageSize$!: Observable<number>;
  @Select(StatsTablesState.page) page$!: Observable<number>;
  @Select(StatsTablesState.time) time$!: Observable<string>;
  @Select(StatsTablesState.showAndFilterFields) showAndFilterFields$!: Observable<string[]>;
  @Select(StatsTablesState.hasData) hasData$!: Observable<boolean>;
  @Select(StatsTablesState.drillDownSteps) drillDownSteps$!: Observable<string[]>;
  // @Select(StatsTablesState.currentTable) currentTable$!: Observable<StatTableModel>;

  canShowNumbering: boolean = true
  name: string = "Students Stats"
  loading: boolean = false
  dummyData: any = ["", "", ""]
  groupingId: string = ""
  queryParams: any
  subscription?: Subscription
  constructor(private store: Store, private actions$: Actions, private activatedRoute: ActivatedRoute, private router: Router) { }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
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
    // console.log("Something is wrong...")
    this.activatedRoute.paramMap.subscribe(params => {
      let queryParams: QueryParamModel[] = []

      this.groupingId = params.get("routing") || ""
      console.log(this.groupingId)
      //Set the table and refresh & Check if any

      if (!this.groupingId) {
        console.log("No grouping id")
        this.router.navigate([`/${groupings[0].name}/`], { queryParams: this.queryParams })
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
      //Set the table and refresh & Check if any
      this.store.dispatch(new InitStatState({ groupings: groupings, queryParams: queryParams, selectedGrouping: this.groupingId, showAndFilterFields: showAndFilterFields }))
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params || {}
      console.log(this.queryParams)
    });

    ///

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

    // if (header.name !== "value") { 
    // const rowValue = this.getRowValue(row, "value")
    // this.store.dispatch(new UpdateHeaderStatus({ header: header, single: true }))
    // this.store.dispatch(new SelectNextTable({ value: rowValue, row: row }))

    //   return
    // }
    // console.log("Drill Down")
    // const rowValue = this.getRowValue(row, header)
    // const displayName=this.getData(row,header)
    // console.log(rowValue)
    // // const currentIndex=this.drillDownSteps.indexOf()
    // console.log(rowValue)
    // this.store.dispatch(new SelectNextTable({ value: rowValue, row: row }))
  }

  onClick() {
    this.store.dispatch(new Navigate(['/admin']))
  }

}
