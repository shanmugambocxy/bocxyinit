import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerTotalVisitPage } from './customer-total-visit.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerTotalVisitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerTotalVisitPageRoutingModule {}
