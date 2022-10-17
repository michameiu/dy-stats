import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Store } from '@ngxs/store';
import { InitStatState } from './store/dy-stat-tables.actions';
import { filterOptions } from './options'
import { DataGroupingModel, QueryParamModel } from './store/dy-stat-tables.models';

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
export class DyStatTablesComponent implements OnInit {


  groupingId: string = ""
  queryParams: any

  constructor(private store: Store, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Pass all the queryParams through the router. To support server side rendering
    // If a filter is updated navigate to the same url with different query param
    // Updating of the query param should not be a replace. 
    // Should check if value macthes before keeping the display name

    console.log("Something is wrong...")
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
  onClick() {
    this.store.dispatch(new Navigate(['/admin']))
  }

}
