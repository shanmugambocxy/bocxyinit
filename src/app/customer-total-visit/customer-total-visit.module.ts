import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerTotalVisitPageRoutingModule } from './customer-total-visit-routing.module';

import { CustomerTotalVisitPage } from './customer-total-visit.page';
import { MerchantCustomerServices } from '../tab4/tab4.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerTotalVisitPageRoutingModule
  ],
  declarations: [CustomerTotalVisitPage],
  providers: [MerchantCustomerServices]
})
export class CustomerTotalVisitPageModule { }
