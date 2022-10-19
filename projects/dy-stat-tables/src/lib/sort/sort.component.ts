import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { TablesState } from '../store/dy-stat-grouping.state';
import { SelectSort } from '../store/dy-stat-tables.actions';
import { TableHeaderModel, TableSortModel } from '../store/dy-stat-tables.models';
import { StatsTablesState } from '../store/dy-stat-tables.state';

@Component({
  selector: 'sistch-stats-lib-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.css']
})
export class SortComponent implements OnInit, OnDestroy {

  @Select(TablesState.headers) headers$!: Observable<TableHeaderModel[]>;
  @Select(StatsTablesState.sort) sort$!: Observable<TableSortModel>;

  sortForm = new FormGroup({
    orderBy: new FormControl(""),
    order: new FormControl("DESC"),
  })
  sortSub?: Subscription
  constructor(private store: Store) { }
  ngOnDestroy(): void {
    this.sortSub?.unsubscribe()
  }

  ngOnInit(): void {
    this.sortSub = this.sort$.subscribe(res => {
      // console.log("Updating", res)
      this.sortForm.patchValue(res || { orderBy: "" })
    })
  }

  updateOrder() {
    // console.log(`Order `, this.sortForm.value)
    this.store.dispatch(new SelectSort(this.sortForm.value))
  }

}
