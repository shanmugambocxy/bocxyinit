import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchantCustomerServices } from './tab4.service';
import { IonicModule } from '@ionic/angular';

import { Tab4PageRoutingModule } from './tab4-routing.module';

import { Tab4Page } from './tab4.page';
import { AppointmentListService } from '../_services/appointmentlist.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab4PageRoutingModule,
  ],
  providers: [
    MerchantCustomerServices,
    AppointmentListService

  ],
  declarations: [Tab4Page]
})
export class Tab4PageModule { }
