import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpensesReportPageRoutingModule } from './expenses-report-routing.module';

import { ExpensesReportPage } from './expenses-report.page';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpensesReportPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ExpensesReportPage],
  providers: [AppointmentListService, AddAnotherServiceService]
})
export class ExpensesReportPageModule { }
