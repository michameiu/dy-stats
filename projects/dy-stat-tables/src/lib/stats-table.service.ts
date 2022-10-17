import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SistchAuthConfigModel } from '@sisitech/ngxs-auth';
import { Observable } from 'rxjs';
import { QueryParamModel } from '../public-api';

@Injectable({
  providedIn: 'root'
})
export class StatsTableService {

  constructor(@Inject('config') private config: SistchAuthConfigModel,
    private http: HttpClient
  ) { }

  getData<T>(url: string, receivedQueryParams: QueryParamModel[]) {
    const defaulQueryParams = [
      { name: "page_size", displayName: "Page Size", value: 100 },
      // { name: "order_by", displayName: "Order By", value: "total_students" },
      // { name: "order", displayName: "Order", value: "DESC" },
    ]
    const queryParams: QueryParamModel[] = [...defaulQueryParams, ...receivedQueryParams]
    const fullUrl = `${this.config.APIEndpoint}/${url}?${this.getQueryParams(queryParams)}`
    return this.http.get<T>(fullUrl)
  }

  getQueryParams(queryParams: QueryParamModel[]) {
    console.log(queryParams)
    return queryParams.map(q => {
      return `${q.name}=${q.value}`
    }).join("&")

    // return Object.keys(queryParams).filter(key => queryParams[key] != null).map(key => {
    //   return `${key}=${queryParams[key]}`
    // }).join("&")
  }

}

