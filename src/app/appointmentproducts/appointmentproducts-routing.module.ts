import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentproductsPage } from './appointmentproducts.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentproductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentproductsPageRoutingModule {}
