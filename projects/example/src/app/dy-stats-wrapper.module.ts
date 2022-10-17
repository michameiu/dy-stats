import { NgModule } from "@angular/core";
import { DyStatTablesModule, DataGroupingModel } from '../../../../dist/dy-stat-tables'
import { filterOptions } from './options'

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
    imports: [DyStatTablesModule]
})
export class DyStatTablesModuleWrapper { }
