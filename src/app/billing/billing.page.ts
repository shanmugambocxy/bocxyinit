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
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import { DateService } from '../_services/date.service';
import { Time } from '../_models/Time.model';


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
  isCard: boolean = false;
  isUPI: boolean = false;
  totalAmount: number = 5000;
  appointment: AppointmentDetail;
  addTip: number = 0;
  // appointment: any;
  bookedServices: any = [];
  subTotal: number = 0;
  CGST: number = 0.09;
  SGST: number = 0.09;
  CGSTAmount: number = 0;
  SGSTAmount: number = 0;
  cardValue = [{ 'id': 1, 'value': 'Cash', 'isSelected': false, icon: 'cash-outline' }, { 'id': 2, 'value': 'Card', 'isSelected': false, icon: 'card-outline' }, { 'id': 3, 'value': 'UPI', 'isSelected': false, icon: 'qr-code-outline' }];
  billValue = [{ 'id': 1, 'value': 'Sub Total' }, { 'id': 2, 'value': 'CGST' }, { 'id': 3, 'value': 'SGST' }, { 'id': 4, 'value': 'Grand Total' }]
  trustedFormbody: any;
  billingForm: FormGroup;
  paymentMode: any;
  productlist: any = [];
  totalProductAmount: number = 0;
  singleProducts: any;
  byValue: number;
  byPercentage: number;
  cash_paid_amount: number = 0;
  card_paid_amount: number = 0;
  upi_paid_amount: number = 0;
  balanceAmount: number;
  grandTotal: number;
  type: any;
  email: any = '';
  individualProductDetails: any;
  getReportData: any;
  totalPriceExpected = 0;
  appointmentEndTime: string;
  appointmentStartTime: string;
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
    private toastService: ToastService,
    private nh: NavigationHandler,
    public dateService: DateService,
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
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    // let merchantStoreId = '61';

    let id = this.route.snapshot.paramMap.get("id");
    let type = this.route.snapshot.paramMap.get("type");
    this.type = type;
    console.log('productlist', this.productlist);
    console.log('will enter', this.singleProducts);
    debugger

    let data: any = [];
    let getData = JSON.parse(localStorage.getItem('listOfProducts'))
    if (getData && getData.length > 0) {
      getData.forEach((element, index) => {
        element.id = index + 1;
      });
      data = getData;
      this.productlist = data;
      console.log('initproductlist', this.productlist);
      let totalProductAmount = _.sumBy(data, 'totalprice');
      this.totalProductAmount = Math.round(totalProductAmount);      // this.grandTotal = this.totalProductAmount
      // this.subTotal = this.totalProductAmount;
    } else {
      data = [];
    }
    if (type == '1') {
      this.id = Number(id);
      this.getAppointmentDetails(this.id);
    } else if (type == '2') {
      let details = JSON.parse(localStorage.getItem('individualProducts'));
      this.individualProductDetails = details;
      this.subTotal = this.totalProductAmount;
      let cgst = (this.subTotal * this.CGST).toFixed(2)
      this.CGSTAmount = cgst ? JSON.parse(cgst) : 0;
      let sgst = (this.subTotal * this.SGST).toFixed(2)
      this.SGSTAmount = sgst ? JSON.parse(sgst) : 0;
      if (merchantStoreId == '61') {
        this.CGSTAmount = 0;
        this.SGSTAmount = 0;
        this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.cash_paid_amount = this.grandTotal;
        console.log('individualproduct', this.grandTotal);
      } else {
        this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.cash_paid_amount = this.grandTotal;
        console.log('individualproduct', this.grandTotal);
      }
      // this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    } else {
      let getReportData = this.route.snapshot.paramMap.get("value");

      if (getReportData) {
        this.getReportData = JSON.parse(getReportData);
        if (this.getReportData.type == "Products") {
          this.totalPriceExpected = this.getReportData.amount;
          this.bookedServices = this.getReportData.bookedServices;
          this.productlist = this.getReportData.products;
          this.subTotal = this.getReportData.subtotal;
          this.CGSTAmount = this.getReportData.CGST;
          this.SGSTAmount = this.getReportData.SGST;
          this.grandTotal = this.getReportData.Grandtotal;
          this.cash_paid_amount = this.getReportData.cash_paid_amount;
          this.card_paid_amount = this.getReportData.card_paid_amount;
          this.upi_paid_amount = this.getReportData.upi_paid_amount;
          this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
        } else {
          this.getAppointmentDetails(this.getReportData.appointmentId);

        }

      }
    }

  }
  ionViewWillEnter() {
    debugger
    console.log('productlist', this.productlist);
    console.log('will enter');
  }

  deleteProduct(item: any) {
    debugger
    this.productlist = this.productlist.filter(x => x.id != item.id);
    if (this.productlist) {
      localStorage.setItem('listOfProducts', JSON.stringify(this.productlist));
      this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
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
        const startTime = new Time(this.appointment.slotName);
        const closeTime = new Time(this.appointment.slotName);
        closeTime.addMinutes(totalDuration);
        this.appointmentStartTime = startTime.toShortTime();
        this.appointmentEndTime = closeTime.toShortTime();
        this.bookedServices = this.appointment.bookedServices;
        this.totalPriceExpected = this.appointment.totalPriceExpected;
        this.subTotal = this.appointment.totalPriceExpected + this.totalProductAmount;
        let cgst = (this.subTotal * this.CGST).toFixed(2)
        this.CGSTAmount = cgst ? JSON.parse(cgst) : 0;
        let sgst = (this.subTotal * this.SGST).toFixed(2)
        this.SGSTAmount = sgst ? JSON.parse(sgst) : 0;
        let merchantStoreId = localStorage.getItem('merchant_store_id');
        // let merchantStoreId = '61';
        if (!this.getReportData) {
          if (merchantStoreId == '61') {
            this.CGSTAmount = 0;
            this.SGSTAmount = 0;
            this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
            this.cash_paid_amount = this.grandTotal;
            console.log('individualproduct', this.grandTotal);
          } else {
            this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
            this.cash_paid_amount = this.grandTotal;
            console.log('individualproduct', this.grandTotal);
          }
        } else {


          this.grandTotal = this.getReportData.Grandtotal;
          this.cash_paid_amount = this.getReportData.cash_paid_amount;
          this.card_paid_amount = this.getReportData.card_paid_amount;
          this.upi_paid_amount = this.getReportData.upi_paid_amount;
          this.CGSTAmount = this.getReportData.CGST ? JSON.parse(this.getReportData.CGST) : 0;
          this.SGSTAmount = this.getReportData.SGST ? JSON.parse(this.getReportData.SGST) : 0;
        }

        // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.cash_paid_amount = this.grandTotal;
        console.log('servicetotal', this.grandTotal);

        // if (this.singleProducts) {
        //   this.subTotal = this.appointment.totalPriceExpected + this.totalProductAmount;
        // } else {
        //   this.subTotal = this.appointment.totalPriceExpected;
        // }
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
    this.discount = 0;
    this.byValue = 0;
    this.byPercentage = 0;
    if (event.detail.value && event.detail.value == 'Disc.by value') {
      this.isByValue = true;
    } else {
      this.isByValue = false;
    }
    debugger
  }
  discountChange(event: any) {
    if (!this.isByValue) {
      let getDiscount = this.byPercentage;
      if (getDiscount) {
        this.discount = (this.subTotal * getDiscount) / 100;
        // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.cash_paid_amount = this.grandTotal;
        this.card_paid_amount = 0;
        this.upi_paid_amount = 0;
      }
    } else {
      this.discount = this.byValue;
      // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      this.cash_paid_amount = this.grandTotal;
      this.card_paid_amount = 0;
      this.upi_paid_amount = 0;


    }
  }
  modeOfPayment(mode: any) {
    debugger
    this.cardValue.forEach(element => {
      if (element.id == mode.id) {
        element.isSelected = !element.isSelected;
      }
    });
    let cash = this.cardValue.filter(x => x.id == 1);
    if (cash[0].isSelected) {
      this.isCash = true;
      this.cash_paid_amount = this.grandTotal;
    } else {
      this.isCash = false;
    }
    let card = this.cardValue.filter(x => x.id == 2);
    if (card[0].isSelected) {
      this.isCard = true;
      let cashAmount = this.cash_paid_amount
      this.card_paid_amount = this.grandTotal - cashAmount;
    } else {
      this.isCard = false;
    }
    let upi = this.cardValue.filter(x => x.id == 3);
    if (upi[0].isSelected) {
      this.isUPI = true;

    } else {
      this.isUPI = false;
    }
  }
  cashChange() {
    this.isCash = !this.isCash;
    if (!this.isCash && !this.isCard && !this.isUPI) {
      this.cash_paid_amount = 0;
      this.card_paid_amount = 0;
      this.upi_paid_amount = 0;
    }
    if (this.isCash && !this.isCard && !this.isUPI) {
      this.cash_paid_amount = this.grandTotal - this.card_paid_amount - this.upi_paid_amount;

      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;
      this.upi_paid_amount = this.grandTotal - this.cash_paid_amount - this.card_paid_amount;

    }
    if (this.isCard && !this.isCash && !this.isUPI) {
      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;

      this.cash_paid_amount = this.grandTotal - this.card_paid_amount - this.upi_paid_amount;
      this.upi_paid_amount = this.grandTotal - this.cash_paid_amount - this.card_paid_amount;

    }
    if (this.isUPI && !this.isCard && !this.isCash) {
      this.upi_paid_amount = this.grandTotal - this.card_paid_amount - this.cash_paid_amount;

      this.cash_paid_amount = this.grandTotal - this.card_paid_amount - this.upi_paid_amount;
      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;


    }
    if (this.isCash && this.isCard && !this.isUPI) {
      this.cash_paid_amount = this.grandTotal - this.card_paid_amount - this.upi_paid_amount;
      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;
    }
    if (this.isCash && this.isCard && this.isUPI) {
      this.cash_paid_amount = this.grandTotal - this.card_paid_amount - this.upi_paid_amount;
      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;
      this.upi_paid_amount = this.grandTotal - this.cash_paid_amount - this.card_paid_amount;
    }


  }
  cardChange() {
    this.isCard = !this.isCard;
    if (this.isCard && !this.isCash && !this.isUPI) {
      this.card_paid_amount = this.grandTotal - this.cash_paid_amount - this.upi_paid_amount;
    }
  }
  upiChange() {
    this.isUPI = !this.isUPI;
    if (this.isUPI && !this.isCard && !this.isCash) {
      this.upi_paid_amount = this.grandTotal - this.cash_paid_amount - this.card_paid_amount;
    }
  }

  cashAmountChange(event: any) {
    debugger
    let value = event.target.value;
    let getValue: number = 0;
    if (value > this.grandTotal) {
      event.target.value = this.grandTotal;
      value = event.target.value;
      this.cash_paid_amount = value;
    }
    if (value) {
      getValue = JSON.parse(value);
    }
    // this.card_paid_amount = Math.abs((this.grandTotal - getValue) - this.upi_paid_amount);
    // this.upi_paid_amount = Math.abs((this.grandTotal - getValue) - this.card_paid_amount);
    let balanceAmount = Math.abs(this.grandTotal - getValue);

    this.card_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.upi_paid_amount);
    this.upi_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.card_paid_amount);
    console.log('balance', this.balanceAmount);
  }
  cardAmountChange(event: any) {
    debugger
    let value = event.target.value;
    let getValue: number = 0;
    if (value > this.grandTotal) {
      event.target.value = this.grandTotal;
      value = event.target.value;
      this.card_paid_amount = value
    }
    if (value) {
      getValue = JSON.parse(value);
    }
    // this.cash_paid_amount = Math.abs((this.grandTotal - getValue) - this.upi_paid_amount);
    // this.upi_paid_amount = Math.abs((this.grandTotal - getValue) - this.cash_paid_amount);
    let balanceAmount = Math.abs(this.grandTotal - getValue);

    this.cash_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.upi_paid_amount);
    this.upi_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.cash_paid_amount);
  }
  UPIAmountChange(event: any) {
    debugger
    let value = event.target.value;
    if (value > this.grandTotal) {
      event.target.value = this.grandTotal;
      value = event.target.value;
      this.upi_paid_amount = value;
    }
    let getValue: number = 0;
    if (value) {
      getValue = JSON.parse(value);

    }
    // this.cash_paid_amount = Math.abs((this.grandTotal - getValue) - this.card_paid_amount);
    // this.card_paid_amount = Math.abs((this.grandTotal - getValue) - this.cash_paid_amount);
    let balanceAmount = Math.abs(this.grandTotal - getValue);

    this.cash_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.card_paid_amount);
    this.card_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.cash_paid_amount);

  }
  addTipChange() {
    console.log('tip', this.addTip);
    // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));

    this.cash_paid_amount = this.grandTotal;
    this.card_paid_amount = 0;
    this.upi_paid_amount = 0;
    // this.grandTotal = this.addTip - this.grandTotal;

  }


  previous() {
    if (this.id) {
      this.nav.GoBackTo('/detailappointment/' + this.id);
    } else {
      this.next();
      // localStorage.removeItem('selectedProducts')
      localStorage.removeItem('listOfProducts');
    }

  }
  next() {
    this.nav.GoBackTo('/home/tabs/tab1');

  }
  gotoReceipt(data) {
    // this.router.navigate(['receipt', { billid: data, type: 1, email: this.email }]);

    this.nh.GoForward('/receipt/' + data);
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
    debugger
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    if (!this.cash_paid_amount) {
      this.cash_paid_amount = 0;
    }
    if (!this.card_paid_amount) {
      this.card_paid_amount = 0
    }
    if (!this.upi_paid_amount) {
      this.upi_paid_amount = 0
    }
    var uuid = uuidv4();
    console.log('uuid', uuid);
    var merchantStoreId = localStorage.getItem('merchant_store_id');
    // var merchantStoreId = '61';
    console.log(' this.cash_paid_amount', typeof this.cash_paid_amount);
    console.log(' this.card_paid_amount', typeof this.card_paid_amount);
    console.log(' this.upi_paid_amount', typeof this.upi_paid_amount);

    var cashAmount = typeof this.cash_paid_amount == 'string' ? this.cash_paid_amount : JSON.stringify(this.cash_paid_amount);
    var cardAmount = typeof this.card_paid_amount == 'string' ? this.card_paid_amount : JSON.stringify(this.card_paid_amount);
    var upiAmount = typeof this.upi_paid_amount == 'string' ? this.upi_paid_amount : JSON.stringify(this.upi_paid_amount);
    let pageType: any;
    var customerName: any;
    var customerMobileNumber: any;
    var staff: any;
    var gender: any;
    var staff_Id: any;
    var productlist = []
    var services = [];
    if (this.type == '1') {
      pageType = "Service & Products";
      customerMobileNumber = this.appointment ? this.appointment.customerMobile : '';
      customerName = this.appointment ? this.appointment.customerName : '';
      gender = this.appointment ? this.appointment.gender : '';
      services = this.appointment.bookedServices
      // staff = this.appointment.bookedServices.length > 0 ? this.appointment.bookedServices[0].stylist : '';
      // staff_Id = this.appointment.bookedServices.length > 0 ? this.appointment.bookedServices[0].stylist_Id : '';
      if (this.productlist && this.productlist.length > 0) {
        for (let i = 0; i < this.productlist.length; i++) {
          let data = {
            product_name: this.productlist[i].productName,
            quantity: JSON.stringify(this.productlist[i].choosequantity),
            price: this.productlist[i].totalprice,
            staff: this.productlist[i].staff,
            staff_Id: this.productlist[i].staff_Id,
            discount: this.productlist[i].discountAmount
          }
          productlist.push(data);
        }
      } else {
        productlist = []
      }
    } else {
      services = [];
      pageType = "Products";
      if (this.individualProductDetails) {
        customerMobileNumber = this.individualProductDetails.mobilenumber ? this.individualProductDetails.mobilenumber : '';
        customerName = this.individualProductDetails.customerName ? this.individualProductDetails.customerName : '';
        staff = this.individualProductDetails.staff ? this.individualProductDetails.staff : '';
        gender = this.individualProductDetails.gender ? this.individualProductDetails.gender : '';
        staff_Id = this.individualProductDetails.staff_Id ? this.individualProductDetails.staff_Id : 0;
        if (this.productlist && this.productlist.length > 0) {
          for (let i = 0; i < this.productlist.length; i++) {
            let data = {
              product_name: this.productlist[i].productName,
              quantity: JSON.stringify(this.productlist[i].choosequantity),
              price: this.productlist[i].totalprice,
              staff: staff,
              staff_Id: staff_Id,
              discount: this.productlist[i].discountAmount
            }
            productlist.push(data);
          }
        } else {
          // gender = '';
        }
      }

    }
    var modeOfPayment: any;
    // modeOfPayment = `${this.cash_paid_amount > 0 ? 'Cash' : ''}${this.card_paid_amount > 0 || this.upi_paid_amount > 0 ? ',' : ''} ${this.card_paid_amount > 0 ? 'Card' : ''} ${this.upi_paid_amount > 0 ? ',' : ''} ${this.upi_paid_amount > 0 ? 'UPI' : ''} `
    let paymentType = (`${this.cash_paid_amount > 0 && this.card_paid_amount == 0 && this.upi_paid_amount == 0 ? 'CASH' : this.cash_paid_amount > 0 && (this.card_paid_amount > 0 || this.upi_paid_amount > 0) ? 'CASH,' : ''}${this.card_paid_amount > 0 && this.cash_paid_amount == 0 && this.upi_paid_amount == 0 ? 'CARD' : this.card_paid_amount > 0 && this.cash_paid_amount > 0 && this.upi_paid_amount == 0 ? 'CARD' : this.card_paid_amount > 0 && this.cash_paid_amount > 0 && this.upi_paid_amount > 0 ? 'CARD,' : ''}${this.upi_paid_amount > 0 ? 'UPI' : ''} `);
    modeOfPayment = paymentType.replace(/ /g, '');
    console.log('modeOfPayment', modeOfPayment);
    let checkAmount = this.cash_paid_amount + this.card_paid_amount + this.upi_paid_amount;

    if (checkAmount < this.grandTotal) {
      this.toastService.showToast("required payable amount is" + ' ' + this.grandTotal + ' ' + "but paid amount is" + ' ' + checkAmount);
      loading.then((l) => l.dismiss());

      return
    }

    let toDaydate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    console.log('date', toDaydate);

    let data = {
      "amount": JSON.stringify(this.subTotal),
      // "paid": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "paid": JSON.stringify(this.grandTotal),
      "created_by": 1,
      "updated_by": 1,
      "discount": this.discount ? JSON.stringify(this.discount) : '0',
      // "gitvoucher": this.redeemVoucher ? JSON.parse(this.redeemVoucher) : 0,
      "gitvoucher": "",
      // "modeofpayment": this.paymentMode,
      "subtotal": JSON.stringify(this.subTotal),
      "tips": JSON.stringify(this.addTip),
      "SGST": JSON.stringify(this.SGSTAmount),
      "CGST": JSON.stringify(this.CGSTAmount),
      // "Grandtotal": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "Grandtotal": JSON.stringify(this.grandTotal),
      "paidAmount": this.payableAmount ? JSON.stringify(this.payableAmount) : '',
      "merchantStoreId": merchantStoreId ? merchantStoreId : 0,
      "name": customerName,
      "phoneno": customerMobileNumber,
      "bill_Id": this.appointment ? this.appointment.bookingId : uuid ? uuid : '',
      // "product_name": this.singleProducts ? this.singleProducts.productName : '',
      // "Quantity": this.singleProducts ? JSON.stringify(this.singleProducts.qty) : '0',
      // "Price": this.singleProducts ? JSON.stringify(this.singleProducts.price) : '0',
      "due_date": toDaydate,
      "created_at": toDaydate,
      "updated_at": toDaydate,
      "gender": gender ? gender : '',
      // "products": this.productlist.length > 0 ? this.productlist : []
      "products": productlist,
      "services": services,
      "modeofpayment": modeOfPayment,
      "type": pageType,
      "cash_paid_amount": cashAmount,
      "card_paid_amount": cardAmount,
      "upi_paid_amount": upiAmount,
    }
    console.log('save_billing', data);
    // if (this.email) {
    // loading.then((l) => l.dismiss());
    // return
    this.appointmentListService.saveBilling(data).subscribe((res) => {
      console.log('res', res);
      loading.then((l) => l.dismiss());
      if (res && res.billId) {
        // this.next();
        var billID = res.billId;
        console.log('billID', billID);
        //email send
        // let sendEmaildata = {
        //   email: this.email,
        //   // path: `receipt/${this.id}/${this.email}`

        //   path: `customerbillpage/${billID ? billID : ''}/${this.email}`
        // }
        // this.httpService.sendReceiptThroughEmail(sendEmaildata).subscribe((res) => {
        //   if (res) {

        //   }
        // })

        if (this.type == "1") {
          this.appointmentListService.updateBilingstatus(this.appointment.appointmentId).subscribe(res => {
            if (res) {
              this.gotoReceipt(billID ? billID : '');
            }
          })
        } else {
          this.gotoReceipt(billID ? billID : '');
        }
      }
      else {
        loading.then((l) => l.dismiss());
        this.toastService.showToast('something went wrong while add billing');
      }
      // this.gotoReceipt(52);
      // this.gotoReceipt(this.appointment ? this.appointment.bookingId : uuid ? uuid : '');
    }, error => {
      console.log('error', error);

      this.toastService.showToast(error)
      loading.then((l) => l.dismiss());
    })
    // } else {
    //   this.toastService.showToast('please enter customer email for receipt');
    //   loading.then((l) => l.dismiss());
    // }

    // } else {
    //   this.toastService.showToast('please select the payment mode')

    // }

  }

}
