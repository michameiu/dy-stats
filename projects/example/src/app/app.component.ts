import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, Logout } from '@sisitech/ngxs-auth';
import { DataGroupingModel } from 'dist/dy-stat-tables';
import { Observable } from 'rxjs';

import { filterOptions } from './options'
import 'bootstrap';

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


