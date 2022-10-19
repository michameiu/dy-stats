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



@NgModule({
  declarations: [
    DyStatTablesComponent,
    BreadcrumbComponent,
    MytdComponent,
    MypaginationComponent,
    MycelldisplayComponent,
    ActionViewComponent,
  ],
  imports: [
    CommonModule,
    DyStatTablesRoutingModule,
    NgxsModule.forFeature([StatsTablesState, TablesState])
    // NgxsRouterPluginModule.forRoot({stor})
  ],
  exports: [
    DyStatTablesComponent,
    BreadcrumbComponent,
    MytdComponent,
    MypaginationComponent,
    MycelldisplayComponent,
    ActionViewComponent,
    // DyStatTablesRoutingModule,
  ]
})
export class DyStatTablesModule {

  static forRoot(groupings: any): ModuleWithProviders<DyStatTablesModule> {
    return {
      ngModule: DyStatTablesModule,
      // providers: [
      //   { provide: 'groupings', useValue: groupings || {} },
      // ]
    };
  }
  static forChild() {
    return {
      ngModule: DyStatTablesModule,
    };
  }
}
