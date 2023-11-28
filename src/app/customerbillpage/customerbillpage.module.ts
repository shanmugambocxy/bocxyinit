import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerbillpagePageRoutingModule } from './customerbillpage-routing.module';

import { CustomerbillpagePage } from './customerbillpage.page';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerbillpagePageRoutingModule
  ],
  declarations: [CustomerbillpagePage],
  providers: [DetailAppointmentService]

})
export class CustomerbillpagePageModule { }
