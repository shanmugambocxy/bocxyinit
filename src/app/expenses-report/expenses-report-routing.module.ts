import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpensesReportPage } from './expenses-report.page';

const routes: Routes = [
  {
    path: '',
    component: ExpensesReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesReportPageRoutingModule {}
