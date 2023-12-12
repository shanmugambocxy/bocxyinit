import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BillingPageRoutingModule } from './billing-routing.module';

import { BillingPage } from './billing.page';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { DateService } from '../_services/date.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BillingPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BillingPage],
  providers: [DetailAppointmentService,
    AppointmentListService, DateService,]
})
export class BillingPageModule { }
