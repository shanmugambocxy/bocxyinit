import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentproductsPageRoutingModule } from './appointmentproducts-routing.module';

import { AppointmentproductsPage } from './appointmentproducts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentproductsPageRoutingModule
  ],
  declarations: [AppointmentproductsPage]
})
export class AppointmentproductsPageModule {}
