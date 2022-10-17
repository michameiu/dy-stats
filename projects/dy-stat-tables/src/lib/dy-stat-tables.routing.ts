import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { DyStatTablesComponent } from './dy-stat-tables.component';

const routes: Routes = [
    {
        path: ':routing',
        component: DyStatTablesComponent,
    },
    {
        path: '',
        component: DyStatTablesComponent,
    },
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DyStatTablesRoutingModule { }