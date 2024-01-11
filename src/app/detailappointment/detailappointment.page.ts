import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastService } from '../_services/toast.service';
import { AppointmentDetail } from './detailappointment.model';
import { DetailAppointmentService } from './detailappointment.service';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { SharedService } from '../_services/shared.service';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { Time } from '../_models/Time.model';
import { Storage } from '@ionic/storage';
import { DateService } from '../_services/date.service';
import * as _ from 'lodash';
import { CustompopupPage } from '../custompopup/custompopup.page';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';
import { AppointmentproductsPage } from '../appointmentproducts/appointmentproducts.page';

@Component({
  selector: 'app-detailappointment',
  templateUrl: './detailappointment.page.html',
  styleUrls: ['./detailappointment.page.scss'],
})
export class DetailappointmentPage implements OnInit {
  productlist: any = [];
  totalProductAmount: any;
  totalProductQty: any = 0;
  totalServiceQty: any = 0;
  constructor(
    public route: ActivatedRoute,
    private toast: ToastService,
    private httpService: DetailAppointmentService,
    private appointmentService: AppointmentListService,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private sharedService: SharedService,
    private nav: NavigationHandler,
    private storage: Storage,
    public dateService: DateService,
    private navCtrl: NavController,
    private router: Router,
    public modalController: ModalController,
    private addService: SharedService,
    private addAnotherServices: AddAnotherServiceService,
  ) {
    this.storage.get('userData').then(x => {
      if (x) {
        this.userData = x;
      }
    });
  }

  paramSubscription: Subscription;
  appointment: AppointmentDetail;
  lastStatus: string;
  cancelReason: string;
  isReadOnly: boolean;
  appointmentEndTime: string;
  appointmentStartTime: string;
  userData: any;
  id: number;
  merchantStoreId: any;
  totalPriceExpectedValue: number = 0;
  ngOnInit() {
    this.isReadOnly = false;
    this.paramSubscription = this.route.params.subscribe(
      async (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        if (params['appointmentId']) {
          this.id = Number(params.appointmentId);
          this.getAppointmentDetails(this.id);
        } else {
          this.toast.showToast('Something went wrong. Please try again');
        }
      });
  }
  ionViewWillEnter() {
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';

    debugger

    console.log('productlist', this.productlist);
    console.log('will enter');
  }

  ionViewDidEnter() {

  }

  getAppointmentDetails(id: number) {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.httpService.getAppointmentDetails(id).subscribe((response) => {
      if (response && response.status === 'SUCCESS') {
        loading.then((l) => l.dismiss());
        this.appointment = response.data;
        let totalDuration = 0;
        this.appointment.totalPriceExpected = response.data.totalPriceExpected;
        if (this.appointment.bookedServices.length > 0) {
          this.totalServiceQty = _.sumBy(this.appointment.bookedServices, 'quantity');
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
        } else {
          this.appointment.totalPriceExpected = 0;
        }
        const startTime = new Time(this.appointment.slotName);
        const closeTime = new Time(this.appointment.slotName);
        closeTime.addMinutes(totalDuration);
        this.appointmentStartTime = startTime.toShortTime();
        this.appointmentEndTime = closeTime.toShortTime();
        this.lastStatus = this.appointment.status;
        this.isReadOnly = (this.appointment.status === 'CANCELED' || this.appointment.status === 'COMPLETED' || this.appointment.billing_status == 'Billed');
        console.log('appointmentList', this.appointment);

        this.httpService.getProductDetails(id).subscribe(res => {
          if (res && res.data.length > 0) {
            this.productlist = res.data;
            this.totalProductQty = _.sumBy(this.productlist, 'quantity');
            this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
          } else {
            this.productlist = [];
            this.totalProductQty = 0;
            this.totalProductAmount = 0;
          }
        })
      }
      else {
        loading.then((l) => l.dismiss());
        this.toast.showToast('Something went wrong plesase try again');
      }
    });
  }

  async customPopup() {
    console.log('popup');

    const modal = await this.modalController.create({
      component: CustompopupPage,
      cssClass: 'my-custom-class',
      animated: true,
    });
    modal.onWillDismiss().then(response => {
      if (response.data) {

      }
    });
    return await modal.present();
  }
  async presentCancelAlertConfirm() {
    if (this.appointment.status === 'CANCELED') {
      // const alert = await this.alertController.create({
      //   cssClass: 'my-custom-class',
      //   header: 'Cancel Appointment',
      //   message: 'Do you want to cancel appointment?',
      //   inputs: [
      //     {
      //       name: 'Reason',
      //       type: 'textarea',
      //       placeholder: 'Cancellation Remarks',
      //       cssClass: 'alertTextBox'
      //     }],
      //   buttons: [
      //     {
      //       text: 'No',
      //       role: 'cancel',
      //       handler: (no) => {
      //         this.appointment.status = this.lastStatus;
      //         console.log('cancel Canceled!');
      //       },
      //     },
      //     {
      //       text: 'Yes',
      //       cssClass: 'secondary',
      //       handler: async (data) => {
      //         this.cancelReason = data.Reason;
      //       },
      //     },
      //   ]
      // });

      // await alert.present();

      const modal = await this.modalController.create({
        component: CustompopupPage,
        cssClass: 'my-custom-class',
        componentProps: { value: 'cancel' }
      });
      modal.onWillDismiss().then(response => {
        debugger
        if (response.data) {
          this.cancelReason = response.data;
        } else {
          this.appointment.status = this.lastStatus;
        }
      });
      return await modal.present();
    }
    else {
      this.cancelReason = null;
    }
  }
  async presentAcceptAlertConfirm(item, type) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: type == 1 ? 'Delete Service' : 'Delete Product',
      message: 'Do you want to delete?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: (no) => {
            console.log('Appointment Accept Canceled!');
          },
        },
        {
          text: 'Yes',
          cssClass: 'secondary',
          handler: async () => {
            if (type == 1) {
              this.deleteService(item)

            } else {
              this.deleteProduct(item)
            }
          },
        },
      ],
    });

    await alert.present();
  }
  deleteProduct(item: any) {
    debugger
    // this.productlist = this.productlist.filter(x => x.id != item.id)
    // if (this.productlist) {
    //   localStorage.setItem('listOfProducts', JSON.stringify(this.productlist));
    //   this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
    // }

    this.httpService.deleteProductDetails(item.id).subscribe(res => {
      if (res.status == "SUCCESS") {
        this.getAppointmentDetails(this.id);
      }
    });

  }
  deleteService(service) {
    debugger
    let data = {
      "appointment_booked_service_id": service.appointment_booked_service_id,
      "appointmentId": this.id ? JSON.stringify(this.id) : 0,
      "serviceId": service.merchant_store_service_id ? JSON.stringify(service.merchant_store_service_id) : 0,
      "professionistAccountId": this.appointment.professionistAccountId ? JSON.stringify(this.appointment.professionistAccountId) : 0
    }
    console.log('data', data);

    this.httpService.deleteService(data).subscribe((response) => {
      if (response.status === 'SUCCESS') {
        let totalExistingServicePrice = _.sumBy(this.appointment.bookedServices, 'totalprice') - service.totalprice;
        let data = {
          appointment_id: this.id,
          totalamount: totalExistingServicePrice
        }
        this.addAnotherServices.addTotalpriceExpected(data).subscribe(addtotal => {
          if (addtotal && addtotal.status === 'SUCCESS') {
            this.sharedService.changeAppointmentMannualRefresh(1);
            this.sharedService.changeNewappointmentListReferesh(1);
            this.sharedService.changeUpcomingAppointmentListReferesh(1);
            this.sharedService.changeWalkinAppointmentReferesh(1);
            this.sharedService.changeAppointmentMannualRefresh(1);

            this.getAppointmentDetails(this.id);
          } else {
            this.toast.showToast('problem occured while adding service');
            // this.saveBtn = false;
          }
        })

      } else {
        this.toast.showToast('problem occured while delete service.')
      }


    })
  }
  onSave() {
    debugger
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.appointmentService.updateAppointmentStatus(this.appointment.appointmentId, this.appointment.status, this.cancelReason).subscribe((response) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.toast.showToast('Successfully updated the appointment');
        this.sharedService.changeAppointmentMannualRefresh(1);
        this.sharedService.changeNewappointmentListReferesh(1);
        this.sharedService.changeUpcomingAppointmentListReferesh(1);
        this.sharedService.changeWalkinAppointmentReferesh(1);
        this.previous();
      }
      else {
        this.toast.showToast('Something went wrong. Please try again');
      }
    });
  }
  checkOut() {
    // this.nav.GoForward('/billing/',{id:12});
    // this.navCtrl.navigateForward(['/billing/]);
    this.router.navigate(['billing', { id: this.id, type: 1 }]);
  }
  previous() {
    localStorage.removeItem('listOfProducts');
    let getRouting = localStorage.getItem('routing');
    if (getRouting) {
      this.nav.GoBackTo(`${getRouting}`);
    } else {
      this.nav.GoBackTo('/home/tabs/tab1');
    }
    // this.navCtrl.back();
  }
  addAnotherService(appointment, type) {
    debugger
    if (type == 1) {
      this.addService.totalPriceExpected = 0;
      this.addService.totalPriceExpected = this.appointment.totalPriceExpected;
      // this.nav.GoForward('/addanotherservice/' + id + '/' + type + '/' + accountId);
      this.nav.GoForward('/addanotherservice/' + appointment.appointmentId + '/' + type + '/' + appointment.professionistAccountId);

    } else {
      // this.nav.GoForward('/appointmentproducts/' + id + '/' + type + '/' + accountId);
      this.showMerchantProductModal(appointment, type);
    }
    // this.nav.GoForward('/addanotherservice/' + id);
    // this.nav.GoForward('/addanotherservice/' + id + '/' + type + '/' + accountId);

  }

  async showMerchantProductModal(appointment, type) {
    debugger
    // this.allVisited = [];
    // this.allVisitedService = [];
    const modal = await this.modalController.create({
      component: AppointmentproductsPage,
      cssClass: 'my-custom-class-product',
      componentProps: {
        id: appointment.appointmentId,
        type: type,
        accountId: appointment.professionistAccountId,
        billid: appointment.bookingId ? JSON.parse(appointment.bookingId) : 0
      }
    });
    modal.onWillDismiss().then(response => {
      if (response) {
        this.getAppointmentDetails(this.id);
        // let data: any = [];
        // let getData = JSON.parse(localStorage.getItem('listOfProducts'))
        // if (getData && getData.length > 0) {
        //   getData.forEach((element, index) => {
        //     element.id = index + 1
        //   });
        //   data = getData;
        // } else {
        //   data = [];
        // }
        // this.productlist = data;
        // this.totalProductAmount = _.sumBy(data, 'totalprice');

      }

    });
    return await modal.present();
  }
}
