import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs/internal/Observable';
import { getHeaderTitle } from '../stats-tables.utils';
import { DataGroupingModel, TableHeaderModel } from '../store/dy-stat-tables.models';
import { StatsTablesState } from '../store/dy-stat-tables.state';

@Component({
  selector: 'sistch-stats-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  constructor(private store: Store) { }
  @Select(StatsTablesState.activeGroupings) groupings$!: Observable<DataGroupingModel[]>;
  @Select(StatsTablesState.queryParams) queryParams$!: Observable<DataGroupingModel[]>;
  @Select(StatsTablesState.activeHeaders) headers$!: Observable<TableHeaderModel[]>;

  ngOnInit(): void {
  }
  title(str: string) {
    return getHeaderTitle(str)
  }
  selectGroup(group: DataGroupingModel) {

    // this.store.dispatch(new SelectGrouping(group))
  }
  onChange(event: any, header: TableHeaderModel) {
    console.log(event)
    const value = event.target.checked
    header.active = value

    // this.store.dispatch(new UpdateHeaderStatus({ header: header, single: true }))
  }

}
