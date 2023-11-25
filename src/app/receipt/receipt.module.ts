import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReceiptPageRoutingModule } from './receipt-routing.module';

import { ReceiptPage } from './receipt.page';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReceiptPageRoutingModule
  ],
  declarations: [ReceiptPage],
  providers: [DetailAppointmentService]
})
export class ReceiptPageModule { }
