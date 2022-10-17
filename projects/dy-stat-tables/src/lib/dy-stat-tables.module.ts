import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { DyStatTablesComponent } from './dy-stat-tables.component';
import { DyStatTablesRoutingModule } from './dy-stat-tables.routing';
import { StatsTablesState } from './store/dy-stat-tables.state';



@NgModule({
  declarations: [
    DyStatTablesComponent
  ],
  imports: [
    CommonModule,
    DyStatTablesRoutingModule,
    NgxsModule.forFeature([StatsTablesState])
    // NgxsRouterPluginModule.forRoot()
  ],
  exports: [
    DyStatTablesComponent,
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
