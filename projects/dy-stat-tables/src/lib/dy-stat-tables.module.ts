import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';
import { ActionViewComponent } from './action-view/action-view.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DyStatTablesComponent } from './dy-stat-tables.component';
import { DyStatTablesRoutingModule } from './dy-stat-tables.routing';
import { MycelldisplayComponent } from './mycelldisplay/mycelldisplay.component';
import { MypaginationComponent } from './mypagination/mypagination.component';
import { MytdComponent } from './mytd/mytd.component';
import { TablesState } from './store/dy-stat-grouping.state';
import { StatsTablesState } from './store/dy-stat-tables.state';
import { SortComponent } from './sort/sort.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyformModule } from '@sisitech/myform';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@sisitech/ngxs-auth';



@NgModule({
  declarations: [
    DyStatTablesComponent,
    BreadcrumbComponent,
    MytdComponent,
    MypaginationComponent,
    MycelldisplayComponent,
    ActionViewComponent,
    SortComponent,
  ],
  imports: [
    CommonModule,
    DyStatTablesRoutingModule,
    NgxsModule.forFeature([StatsTablesState, TablesState]),
    // NgxsRouterPluginModule.forRoot({stor})
    FormsModule,
    ReactiveFormsModule,
    MyformModule
  ],
  exports: [
    DyStatTablesComponent,
    BreadcrumbComponent,
    MytdComponent,
    MypaginationComponent,
    MycelldisplayComponent,
    ActionViewComponent,
    MyformModule
    // DyStatTablesRoutingModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class DyStatTablesModule {

  static forChild(config: { groupings: any, formGroupOrder: any[], myformConfig: any, filterOptions: any }): ModuleWithProviders<DyStatTablesModule> {
    return {
      ngModule: DyStatTablesModule,
      providers: [
        { provide: 'groupings', useValue: config.groupings || {}, },
        { provide: 'myformConfig', useValue: config.myformConfig || {}, },
        { provide: 'filterOptions', useValue: config.filterOptions || {}, },
        { provide: 'formGroupOrder', useValue: config.formGroupOrder || [], },
      ]
    };
  }
}
