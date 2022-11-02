import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, Logout } from '@sisitech/ngxs-auth';
import { DataGroupingModel } from 'dist/dy-stat-tables';
import { Observable } from 'rxjs';
import { enrollmentFilterOptions } from './enrollment_options'
import { filterOptions } from './options'
import 'bootstrap';
import { attendanceFilterOptions } from './attendance_options';

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
  formItems: any = attendanceFilterOptions
  stats_count = 0
  args = {}
  isValidationOnly = true
  formGroupOrder = [
    // ['paginator'],
    ['school_county', 'school_sub_county', 'gender'],
    ['school', 'base_class', 'status'],
    ['start_date', 'end_date']
  ]
  filters: any;

  onValidatedData(data: any) {
    const { filters, descriptions } = this.parseFilters(data)
    console.log(filters, descriptions)
    this.filters = filters
  }

  constructor(private store: Store,) {
    // console.log(groupings)
  }

  logout() {
    this.store.dispatch(new Logout())
  }


  parseFilters(data: any) {
    let ignoreFiltersForDecription = ["report_type", "grouping", "paginator"]
    let descriptions = []

    let parsedFilters: any = {}
    for (let key in data) {
      const filterValue = data[key]
      if (!filterValue) continue
      if (typeof filterValue == "object") {
        if (filterValue.hasOwnProperty("value")) {
          parsedFilters[key] = filterValue.value
        }
        if (filterValue.hasOwnProperty("details")) {
          for (let index in filterValue.details) {
            const description = filterValue.details[index]
            if (description.hasOwnProperty("description")) {
              if (!ignoreFiltersForDecription.includes(key))
                descriptions.push(description.description)
            }
          }
        }
      } else {
        parsedFilters[key] = filterValue
        if (!ignoreFiltersForDecription.includes(key))
          descriptions.push(`${key}*${filterValue}`)
      }
    }


    return { filters: parsedFilters, descriptions: descriptions }
  }

}


