import { Component, OnInit } from '@angular/core';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentDetail } from '../detailappointment/detailappointment.model';
import { ToastService } from '../_services/toast.service';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

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
  trustedFormbody: any;
  billingForm: FormGroup;
  paymentMode: any;
  productlist: any = [];
  totalProductAmount: any;
  singleProducts: any;
  constructor(private nav: NavigationHandler,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
    private httpService: DetailAppointmentService,
    private loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private appointmentListService: AppointmentListService,
    private formBuilder: FormBuilder,
    private toastService: ToastService

  ) {


  }

  ngOnInit() {
    // this.appointmentListService.getBilling().subscribe((res) => {
    //   if (res) {
    //     console.log('res', res);

    //   }
    // })
    // this.billingForm = this.formBuilder.group({
    //   paid: ['', Validators.compose([
    //     Validators.required
    //   ])],
    //   discount: [null, Validators.compose([
    //     Validators.required
    //   ])],
    //   gitvoucher: [null, Validators.compose([
    //     Validators.required
    //   ])], modeofpayment: [null, Validators.compose([
    //     Validators.required
    //   ])],
    //   tips: [null, Validators.compose([
    //     Validators.required
    //   ])], paidAmount: [null, Validators.compose([
    //     Validators.required
    //   ])],

    // });
    let id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.id = Number(id);
      this.getAppointmentDetails(this.id);
    }
  }

  ionViewWillEnter() {


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
        let getProducts = localStorage.getItem('selectedProducts');
        if (getProducts) {
          let data = JSON.parse(getProducts);
          if (data.length > 0) {
            this.productlist = data;
          } else if (data) {
            // this.productlist = [data]
            this.singleProducts = data;
            this.productlist = [data];

            this.totalProductAmount = data.price;
          }
        }
        console.log('productlist', this.productlist);
        console.log('will enter', this.singleProducts);
        if (this.singleProducts) {
          this.subTotal = this.appointment.totalPriceExpected + this.singleProducts.price;
        } else {
          this.subTotal = this.appointment.totalPriceExpected;

        }
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
    this.paymentMode = mode.value;
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
  next() {
    this.nav.GoBackTo('/home/tabs/tab1');

  }

  placeOrder() {
    // hdfcPayment() {
    const data = {
      amount: this.totalAmount
    };


    // this.http.post('https://payment-bocxy.ap-south-1.elasticbeanstalk.com/api/hdfcPayment', data, { responseType: 'text' }).subscribe(

    this.http.post('http://localhost:3001/api/hdfcPayment', data, { responseType: 'text' }).subscribe(
      (response: any) => {
        console.log(response);
        this.trustedFormbody = this.sanitizer.bypassSecurityTrustHtml(response);
        // Automatically submit the form
        setTimeout(() => {
          // const formElement = document.getElementById('nonseamless');
          const formElement = document.getElementById('nonseamless') as HTMLFormElement;
          // const formElement = this.trustedFormbody.nonseamless.nativeElement as HTMLFormElement;
          console.log('form:', formElement);
          if (formElement) {
            console.log('form submit');
            formElement.submit();
          }
        }, 1000);
      }, (error) => {
        console.log('payment', error);
      }
    );
  }
  // }

  saveBilling() {

    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    let toDaydate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    console.log('date', toDaydate);
    let data = {
      "amount": JSON.stringify(this.subTotal),
      "paid": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "created_by": 1,
      "updated_by": 1,
      "discount": JSON.stringify(this.discount),
      // "gitvoucher": this.redeemVoucher ? JSON.parse(this.redeemVoucher) : 0,
      "gitvoucher": "Amazon Gift Card",
      "modeofpayment": this.paymentMode,
      "subtotal": JSON.stringify(this.subTotal),
      "tips": JSON.stringify(this.addTip),
      "SGST": JSON.stringify(this.subTotal * this.SGST),
      "CGST": JSON.stringify(this.subTotal * this.CGST),
      "Grandtotal": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "paidAmount": JSON.stringify(this.payableAmount),
      // "merchantStoreId": 62,
      "merchantStoreId": this.appointment.customer_account_id,
      "name": this.appointment.customerName,
      "phoneno": this.appointment.customerMobile,
      "bill_Id": this.appointment.bookingId,
      "product_name": this.singleProducts.productName,
      "Quantity": JSON.stringify(this.singleProducts.qty),
      "Price": JSON.stringify(this.singleProducts.price),
      "due_date": toDaydate,
      "created_at": toDaydate,
      "updated_at": toDaydate,
      "gender": "male"

    }
    console.log('save_billing', data);
    this.appointmentListService.saveBilling(data).subscribe((res) => {
      loading.then((l) => l.dismiss());
      if (res) {

        this.next();
      } else {
        this.toastService.showToast('something went wrong while add billing')
      }
    })
  }
}
