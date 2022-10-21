import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { utilsConfigureLazyModule } from '../../../../dist/dy-stat-tables';
import { filterOptions } from './options';
const showAndFilterFields = ['present_males', 'present_females', 'absent_males', 'absent_females']

const attendanceGroupings = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/attendances/${choice.value}`,
    valueField: "",
    tables: [],
    // sort: {
    //   orderBy: 'total_attendances_taken',
    //   order: SortDirection.ASC
    // },
    showAndFilterFields: choice.only_and_filter_fields ? choice.only_and_filter_fields : showAndFilterFields,
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))


const enrollmentGroupings = filterOptions.actions.POST.grouping.choices
  .map((choice: any) => ({
    name: choice.value,
    displayName: choice.display_name,
    filterName: choice.filter_name || choice.value,
    url: `api/v1/stats/students/${choice.value}`,
    valueField: "",
    tables: [],
    showAndFilterFields: choice.only_and_filter_fields ? choice.only_and_filter_fields : ['males', 'females'],
    rowDisplayField: choice.row_display_field || `${choice.value}_name`.replace(/-/g, "_"),
  }))


const routes: Routes = [
  {
    path: 'attendances',
    loadChildren: () => {
      return import('../../../../dist/dy-stat-tables').then(m => utilsConfigureLazyModule(m.DyStatTablesModule.forChild(attendanceGroupings)))
    }
  },
  {
    path: 'enrollment',
    loadChildren: () => {
      return import('../../../../dist/dy-stat-tables').then(m => utilsConfigureLazyModule(m.DyStatTablesModule.forChild(enrollmentGroupings)))
    }
  },
  {
    path: "",
    redirectTo: "enrollment",
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
