import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustompopupPage } from './custompopup.page';

const routes: Routes = [
  {
    path: '',
    component: CustompopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustompopupPageRoutingModule {}
