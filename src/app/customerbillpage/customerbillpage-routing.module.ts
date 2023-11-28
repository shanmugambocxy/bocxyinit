import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerbillpagePage } from './customerbillpage.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerbillpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerbillpagePageRoutingModule {}
