import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { merchantNotificationService } from '../notifications/notfications.service';
import { IonicModule } from '@ionic/angular';

import { Tab1PageRoutingModule } from './tab1-routing.module';

import { Tab1Page } from './tab1.page';

import { DashboardService } from './tab1.service';
import { SocketService } from '../_services/socket.service';
import { AppointmentListService } from '../_services/appointmentlist.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab1PageRoutingModule,
  ],
  declarations: [Tab1Page],
  providers: [DatePipe, DashboardService, merchantNotificationService, SocketService, AppointmentListService]
})
export class Tab1PageModule { }
