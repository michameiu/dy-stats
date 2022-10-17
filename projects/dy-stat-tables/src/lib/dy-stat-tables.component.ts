import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Select, Store } from '@ngxs/store';
import { InitStatState } from './store/dy-stat-tables.actions';
import { filterOptions } from './options'
import { DataGroupingModel, QueryParamModel, TableHeaderModel } from './store/dy-stat-tables.models';
import { StatsTablesState } from './store/dy-stat-tables.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs';

const groupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/students/${choice.value}`,
    valueField: "",
    tables: [],
    rowDisplayField: choice.row_display_field || `${choice.value}a_name`.replace(/-/g, "_"),
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
  constructor(private store: Store, private activatedRoute: ActivatedRoute, private router: Router) { }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }

  ngOnInit(): void {
    // Pass all the queryParams through the router. To support server side rendering
    // If a filter is updated navigate to the same url with different query param
    // Updating of the query param should not be a replace. 
    // Should check if value macthes before keeping the display name
    this.subscription = this.results$.subscribe(res => {
      console.log("Results are")
      console.log(res)
    })
    // console.log("Something is wrong...")
    this.activatedRoute.paramMap.subscribe(params => {
      this.groupingId = params.get("routing") || ""

      //Set the table and refresh & Check if any
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params || {}
      let queryParams: QueryParamModel[] = []
      if (!this.groupingId) {
        console.log("No grouping id")
        this.router.navigate([`/${groupings[0].name}/`], { queryParams: this.queryParams })
        return
      }
      console.log(this.groupingId)
      console.log(this.queryParams)

      for (let key in this.queryParams) {
        queryParams.push({ name: key, value: this.queryParams[key] })
      }
      //Set the table and refresh & Check if any
      this.store.dispatch(new InitStatState({ groupings: groupings, queryParams: queryParams, selectedGrouping: this.groupingId }))
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
    console.log(header, row)
    if (header.name !== "value") {
      // const rowValue = this.getRowValue(row, "value")
      // this.store.dispatch(new UpdateHeaderStatus({ header: header, single: true }))
      // this.store.dispatch(new SelectNextTable({ value: rowValue, row: row }))

      return
    }
    console.log("Drill Down")
    const rowValue = this.getRowValue(row, header)
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
