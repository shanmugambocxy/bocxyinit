import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentServicePageRoutingModule } from './appointmentservice-routing.module';

import { AppointmentServicePage } from './appointmentservice.page';
import { DirectivesModule } from '../_directives/directives.module';
import { AppointmentServiceService } from './appointmentservice.service';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentServicePageRoutingModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  declarations: [AppointmentServicePage],
  providers: [AppointmentServiceService, AddAnotherServiceService]
})
export class AppointmentServicePageModule { }
