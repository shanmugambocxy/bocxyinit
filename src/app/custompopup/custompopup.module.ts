import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustompopupPageRoutingModule } from './custompopup-routing.module';

import { CustompopupPage } from './custompopup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustompopupPageRoutingModule
  ],
  declarations: [CustompopupPage]
})
export class CustompopupPageModule {}
