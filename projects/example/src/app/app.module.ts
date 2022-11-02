import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsAuthModule } from '@sisitech/ngxs-auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataGroupingModel } from '../../../../dist/dy-stat-tables'
import { filterOptions } from './options'

export const authConfig = {
  APIEndpoint: "https://api.onekana.naconek.ke",
  version: "api/v1",
  clientId: "MkNyGrkTC8nr2eq6t9xrNW7SixjWR97AwW0ZlFHc",
}


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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
