import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsAuthModule } from '@sisitech/ngxs-auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataGroupingModel } from '../../../../dist/dy-stat-tables'
import { filterOptions } from './options'

const authConfig = {
  APIEndpoint: "https://api.onekana.naconek.ke",
  version: "api/v1",
  clientId: "MkNyGrkTC8nr2eq6t9xrNW7SixjWR97AwW0ZlFHc",
}

const groupings: DataGroupingModel[] = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value, displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: choice.name,
    valueField: "",
    tables: [],
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxsAuthModule.forRoot(authConfig),
    NgxsModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
  ],
  providers: [
    { provide: 'groupings', useValue: groupings || {} },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
