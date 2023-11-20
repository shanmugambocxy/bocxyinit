import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddStoreProductPageRoutingModule } from './add-store-product-routing.module';

import { AddStoreProductPage } from './add-store-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddStoreProductPageRoutingModule
  ],
  declarations: [AddStoreProductPage]
})
export class AddStoreProductPageModule {}
