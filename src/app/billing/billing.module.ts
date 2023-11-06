import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BillingPageRoutingModule } from './billing-routing.module';

import { BillingPage } from './billing.page';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BillingPageRoutingModule
  ],
  declarations: [BillingPage],
  providers: [DetailAppointmentService]
})
export class BillingPageModule { }
