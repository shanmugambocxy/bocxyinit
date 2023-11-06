import { Component, OnInit } from '@angular/core';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentDetail } from '../detailappointment/detailappointment.model';
import { ToastService } from '../_services/toast.service';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
})
export class BillingPage implements OnInit {
  id: number;
  isByValue: boolean = false;
  valueSelected: any;
  discount: number;
  redeemVoucher: any;
  payableAmount: number;
  isCash: boolean = false;
  totalAmount: number = 5000;
  appointment: AppointmentDetail;
  addTip: number = 0;
  // appointment: any;
  bookedServices: any = [];
  subTotal: number = 0;
  CGST: number = 0.09;
  SGST: number = 0.09;
  cardValue = [{ 'id': 1, 'value': 'Cash', 'isSelected': false, icon: 'cash-outline' }, { 'id': 2, 'value': 'Card', 'isSelected': false, icon: 'card-outline' }, { 'id': 3, 'value': 'UPI', 'isSelected': false, icon: 'qr-code-outline' }];
  billValue = [{ 'id': 1, 'value': 'Sub Total' }, { 'id': 2, 'value': 'CGST' }, { 'id': 3, 'value': 'SGST' }, { 'id': 4, 'value': 'Grand Total' }]
  constructor(private nav: NavigationHandler,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private httpService: DetailAppointmentService,
    private loadingCtrl: LoadingController,

  ) {


  }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.id = Number(id);
      this.getAppointmentDetails(this.id);
    }
  }

  getAppointmentDetails(id: number) {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.httpService.getAppointmentDetails(id).subscribe((response) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.appointment = response.data;
        console.log('appoinment', this.appointment);

        let totalDuration = 0;
        this.bookedServices = [];

        for (const service of this.appointment.bookedServices) {
          if (!service.stylist) {
            service.stylist = this.appointment.stylistName;
          }
          if (service.duration < 60) {
            service.totalDuration = `${service.duration} min`;
          }
          else {
            service.totalDuration = (service.duration % 60) === 0 ? `${Math.trunc(service.duration / 60)}h` : `${Math.trunc(service.duration / 60)}h ${service.duration % 60}min`;
          }
          totalDuration = totalDuration + service.duration;
        }
        this.bookedServices = this.appointment.bookedServices;
        this.subTotal = this.appointment.totalPriceExpected;
        console.log('data', this.bookedServices);

        // const startTime = new Time(this.appointment.slotName);
        // const closeTime = new Time(this.appointment.slotName);
        // closeTime.addMinutes(totalDuration);
        // this.appointmentStartTime = startTime.toShortTime();
        // this.appointmentEndTime = closeTime.toShortTime();
        // this.lastStatus = this.appointment.status;
        // this.isReadOnly = (this.appointment.status === 'CANCELED' || this.appointment.status === 'COMPLETED');
      }
      else {
        this.toast.showToast('Something went wrong plesase try again');
      }
    });
  }

  onSelectDiscount(event: any) {
    console.log('event', event);
    // this.valueSelected = true;
    if (event.detail.value && event.detail.value == 'Disc.by value') {
      this.isByValue = true;
    } else {
      this.isByValue = false;

    }
    debugger
  }
  modeOfPayment(mode: any) {
    // this.cardValue = [{ 'id': 1, 'value': 'Cash', 'isSelected': false }, { 'id': 2, 'value': 'Card', 'isSelected': false }, { 'id': 3, 'value': 'Phone pe', 'isSelected': false }, { 'id': 4, 'value': 'Google Pay', 'isSelected': false }];

    // mode.isSelected = true;
    if (mode.id == 1) {
      this.isCash = true;
    } else {
      this.isCash = false;
    }
    this.cardValue.forEach(element => {
      if (element.id == mode.id) {
        element.isSelected = true;
      } else {
        element.isSelected = false;
      }
    })

  }
  addTipChange() {
    console.log('tip', this.addTip);

  }


  previous() {
    this.nav.GoBackTo('/detailappointment/' + this.id);

  }
}
