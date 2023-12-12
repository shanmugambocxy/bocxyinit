import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsPageRoutingModule } from './reports-routing.module';

import { ReportsPage } from './reports.page';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { StylistManagementService } from '../stylistmgmt/stylistmgmt.service';
import { DateService } from '../_services/date.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportsPageRoutingModule
  ],
  declarations: [ReportsPage],
  providers: [AppointmentListService, DatePipe, DetailAppointmentService, StylistManagementService, DateService]
})
export class ReportsPageModule { }
