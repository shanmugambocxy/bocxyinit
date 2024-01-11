import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentproductsPageRoutingModule } from './appointmentproducts-routing.module';

import { AppointmentproductsPage } from './appointmentproducts.page';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentproductsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AppointmentproductsPage],
  providers: [AddAnotherServiceService, AppointmentServiceService]
})
export class AppointmentproductsPageModule { }
