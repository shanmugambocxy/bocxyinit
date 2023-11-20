import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddStoreProductPage } from './add-store-product.page';

const routes: Routes = [
  {
    path: '',
    component: AddStoreProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddStoreProductPageRoutingModule {}
