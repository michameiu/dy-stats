import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, Logout } from '@sisitech/ngxs-auth';
import { DataGroupingModel } from 'dist/dy-stat-tables';
import { Observable } from 'rxjs';

import { filterOptions } from './options'

const groupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value, displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: choice.name,
    valueField: "",
    tables: [],
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @Select(AuthState.access_token) token$!: Observable<string>;
  @Select(AuthState.isAuthenticated) isAuthenticated$!: Observable<boolean>;
  @Select(AuthState.full_name) profile$!: Observable<string>;
  title = 'example';

  constructor(private store: Store,) {
    // console.log(groupings)
  }

  logout() {
    this.store.dispatch(new Logout())
  }
}


