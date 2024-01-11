import { Component, OnInit } from '@angular/core';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
import { AccountSettingsService } from '../accountsettings/accountsettings.service';
import { SharedService } from '../_services/shared.service';
import { SocketService } from '../_services/socket.service';
import { Subscription } from 'rxjs';


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
  // CGST: number = 0;
  // SGST: number = 0;
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
  merchantStoreId: any;
  totalProductQty: any = 0;
  totalServiceQty: any = 0;
  paramSubscription: Subscription;
  productview: boolean = false;
  serviceproductView: boolean = false;

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
    private accountSettingsService: AccountSettingsService,
    private sharedService: SharedService,
    private socketService: SocketService
  ) {

  }

  async ngOnInit() {
    debugger
    await this.accountSettingsService.getCurrentUserAccountForMerchant().subscribe((accountData: any) => {
      this.merchantStoreId = localStorage.getItem('merchant_store_id');
      if (accountData.status === 'SUCCESS') {
        if (accountData.data.GstPercentage && accountData.data.GstPercentage != null && accountData.data.GstPercentage != '') {
          let gstPercentage = JSON.parse(accountData.data.GstPercentage) / 2;
          this.CGST = gstPercentage / 100;
          this.SGST = gstPercentage / 100;
        } else {
          this.CGST = 0;
          this.SGST = 0;
          this.CGSTAmount = 0;
          this.SGSTAmount = 0;
        }
        let id = this.route.snapshot.paramMap.get("id");
        let type = this.route.snapshot.paramMap.get("type");
        this.type = type;
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
          this.totalProductQty = _.sumBy(data, 'choosequantity');
          this.totalProductAmount = Math.round(totalProductAmount);
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
          this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
          this.cash_paid_amount = this.grandTotal;
        } else {
          let getReportData = this.route.snapshot.paramMap.get("value");
          if (getReportData) {
            this.getReportData = JSON.parse(getReportData);
            if (this.getReportData.type == "Products") {
              this.totalPriceExpected = this.getReportData.amount;
              this.bookedServices = this.getReportData.bookedServices;
              this.productlist = [];
              this.productlist = this.getReportData.products;
              console.log('productlist', this.productlist);

              this.subTotal = this.getReportData.subtotal;
              this.CGSTAmount = this.getReportData.CGST;
              this.SGSTAmount = this.getReportData.SGST;
              this.grandTotal = this.getReportData.Grandtotal;
              this.cash_paid_amount = this.getReportData.cash_paid_amount;
              this.card_paid_amount = this.getReportData.card_paid_amount;
              this.upi_paid_amount = this.getReportData.upi_paid_amount;
              this.totalProductQty = _.sumBy(this.productlist, 'Quantity');
              this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
              this.productview = true;
            } else {
              console.log('app2');
              if (this.getReportData.products.length > 0) {
                // this.getReportData.products.forEach(element => {
                //   element.discountAmount = element.discount
                // });
                this.productlist = [];
                this.productlist = this.getReportData.products;
                this.totalProductQty = _.sumBy(this.productlist, 'Quantity');
                let totalProductAmount = _.sumBy(this.productlist, 'totalprice');
                this.totalProductAmount = Math.round(totalProductAmount);
                this.serviceproductView = true;

              }
              this.getAppointmentDetails(this.getReportData.appointmentId);
            }

          }
        }
      }
    });
  }
  ionViewWillEnter() {
    debugger

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
    debugger
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.httpService.getAppointmentDetails(id).subscribe((response) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.httpService.getProductDetails(id).subscribe(products => {
          if (products && products.data.length > 0) {
            this.productlist = products.data;
            this.totalProductQty = _.sumBy(this.productlist, 'quantity');
            this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
          } else {
            this.productlist = [];
            this.totalProductQty = 0;
            this.totalProductAmount = 0;
          }
          this.appointment = response.data;
          let totalDuration = 0;
          this.bookedServices = [];
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
          }
          const startTime = new Time(this.appointment.slotName);
          const closeTime = new Time(this.appointment.slotName);
          closeTime.addMinutes(totalDuration);
          this.appointmentStartTime = startTime.toShortTime();
          this.appointmentEndTime = closeTime.toShortTime();
          this.bookedServices = this.appointment.bookedServices;
          this.subTotal = this.appointment.totalPriceExpected + this.totalProductAmount;
          let cgst = (this.subTotal * this.CGST).toFixed(2);
          this.CGSTAmount = cgst ? JSON.parse(cgst) : 0;
          let sgst = (this.subTotal * this.SGST).toFixed(2);
          this.SGSTAmount = sgst ? JSON.parse(sgst) : 0;
          if (!this.getReportData) {
            this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
            this.cash_paid_amount = this.grandTotal;
          } else {
            this.grandTotal = this.getReportData.Grandtotal;
            this.cash_paid_amount = this.getReportData.cash_paid_amount;
            this.card_paid_amount = this.getReportData.card_paid_amount;
            this.upi_paid_amount = this.getReportData.upi_paid_amount;
            this.CGSTAmount = this.getReportData.CGST ? JSON.parse(this.getReportData.CGST) : 0;
            this.SGSTAmount = this.getReportData.SGST ? JSON.parse(this.getReportData.SGST) : 0;
          }
        })

      }
      else {
        this.toast.showToast('Something went wrong plesase try again');
      }
    });
  }

  onSelectDiscount(event: any) {
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

    let balanceAmount = Math.abs(this.grandTotal - getValue);

    this.card_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.upi_paid_amount);
    this.upi_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.card_paid_amount);
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

    let balanceAmount = Math.abs(this.grandTotal - getValue);

    this.cash_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.card_paid_amount);
    this.card_paid_amount = Math.abs(balanceAmount == 0 ? 0 : balanceAmount - this.cash_paid_amount);

  }
  addTipChange() {
    this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));

    this.cash_paid_amount = this.grandTotal;
    this.card_paid_amount = 0;
    this.upi_paid_amount = 0;

  }


  previous() {
    if (this.id) {
      this.nav.GoBack();
    } else {
      this.nav.GoBack();

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
        this.trustedFormbody = this.sanitizer.bypassSecurityTrustHtml(response);
        // Automatically submit the form
        setTimeout(() => {
          // const formElement = document.getElementById('nonseamless');
          const formElement = document.getElementById('nonseamless') as HTMLFormElement;
          // const formElement = this.trustedFormbody.nonseamless.nativeElement as HTMLFormElement;
          if (formElement) {
            formElement.submit();
          }
        }, 1000);
      }, (error) => {
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
    // var uuid = uuidv4();
    var uuid: any;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = (currentDate.getDate()).toString().padStart(2, "0");
    const currentYear = currentDate.getFullYear();
    const lastTwoDigits = currentYear % 100;
    var bookingId: any
    bookingId = lastTwoDigits + month + day + this.merchantStoreId + code;
    console.log('bookingId', bookingId);

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
      customerMobileNumber = this.appointment ? this.appointment.customerMobile : '';
      customerName = this.appointment ? this.appointment.customerName : '';
      gender = this.appointment ? this.appointment.gender : '';
      services = this.appointment.bookedServices
      if (this.productlist && this.productlist.length > 0) {
        for (let i = 0; i < this.productlist.length; i++) {
          let data = {
            product_name: this.productlist[i].product_name,
            quantity: this.productlist[i].quantity,
            // price: this.productlist[i].totalprice,
            price: this.productlist[i].price,
            staff: this.productlist[i].staff,
            staff_Id: this.productlist[i].staff_Id,
            // discount: this.productlist[i].discountAmount
            discount: this.productlist[i].discount,
            discountamount: this.productlist[i].discountamount,
            totalprice: this.productlist[i].totalprice

          }
          productlist.push(data);
        }
      } else {
        productlist = []
      }
      if (this.appointment.bookedServices && this.appointment.bookedServices.length > 0 && this.productlist.length == 0) {
        pageType = "Service";
      } else if (this.appointment.bookedServices && this.appointment.bookedServices.length > 0 && this.productlist.length > 0) {
        pageType = "Service & Products";
      } else {
        pageType = "Service & Products";
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
              // price: this.productlist[i].totalprice,
              price: this.productlist[i].actualPrice,
              staff: staff,
              staff_Id: staff_Id,
              // discount: this.productlist[i].discountAmount
              discount: this.productlist[i].choosediscount && this.productlist[i].choosediscount != null && this.productlist[i].choosediscount != '' ? JSON.parse(this.productlist[i].choosediscount) : 0,
              discountamount: Math.round(this.productlist[i].discountAmount),
              totalprice: this.productlist[i].totalprice
            }
            productlist.push(data);
          }
        } else {
        }
      }
    }
    var modeOfPayment: any;
    let paymentType = (`${this.cash_paid_amount > 0 && this.card_paid_amount == 0 && this.upi_paid_amount == 0 ? 'CASH' : this.cash_paid_amount > 0 && (this.card_paid_amount > 0 || this.upi_paid_amount > 0) ? 'CASH,' : ''}${this.card_paid_amount > 0 && this.cash_paid_amount == 0 && this.upi_paid_amount == 0 ? 'CARD' : this.card_paid_amount > 0 && this.cash_paid_amount > 0 && this.upi_paid_amount == 0 ? 'CARD' : this.card_paid_amount > 0 && this.cash_paid_amount > 0 && this.upi_paid_amount > 0 ? 'CARD,' : ''}${this.upi_paid_amount > 0 ? 'UPI' : ''} `);
    modeOfPayment = paymentType.replace(/ /g, '');
    let checkAmount = this.cash_paid_amount + this.card_paid_amount + this.upi_paid_amount;
    if (checkAmount < this.grandTotal) {
      this.toastService.showToast("required payable amount is" + ' ' + this.grandTotal + ' ' + "but paid amount is" + ' ' + checkAmount);
      loading.then((l) => l.dismiss());
      return
    }
    let toDaydate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    let data = {
      "amount": JSON.stringify(this.subTotal),
      "paid": JSON.stringify(this.grandTotal),
      "created_by": 1,
      "updated_by": 1,
      "discount": this.discount ? JSON.stringify(this.discount) : '0',
      "gitvoucher": "",
      "subtotal": JSON.stringify(this.subTotal),
      "tips": JSON.stringify(this.addTip),
      "SGST": JSON.stringify(this.SGSTAmount),
      "CGST": JSON.stringify(this.CGSTAmount),
      "Grandtotal": JSON.stringify(this.grandTotal),
      "paidAmount": this.payableAmount ? JSON.stringify(this.payableAmount) : '',
      "merchantStoreId": this.merchantStoreId ? this.merchantStoreId : '0',
      "name": customerName,
      "phoneno": customerMobileNumber,
      "bill_Id": this.appointment ? this.appointment.bookingId : bookingId ? bookingId : '',
      "due_date": toDaydate,
      "created_at": toDaydate,
      "updated_at": toDaydate,
      "gender": gender ? gender : '',
      "products": productlist,
      "services": services,
      "modeofpayment": modeOfPayment,
      "type": pageType,
      "cash_paid_amount": cashAmount,
      "card_paid_amount": cardAmount,
      "upi_paid_amount": upiAmount,
    }
    this.appointmentListService.saveBilling(data).subscribe((res) => {
      loading.then((l) => l.dismiss());

      if (res && res.billId) {
        localStorage.removeItem('listOfProducts');
        localStorage.removeItem('individualProducts');
        this.sharedService.publishFormRefresh();
        // this.socketService.sendSaleslistReport('');

        if (this.type == "1") {
          this.appointmentListService.updateBilingstatus(this.appointment.appointmentId).subscribe(updateRes => {
            if (updateRes) {
              this.gotoReceipt(res.billId ? res.billId : '');
            }
          })
        } else {
          this.gotoReceipt(res.billId ? res.billId : '');
        }
      }
      else {
        loading.then((l) => l.dismiss());
        this.toastService.showToast('something went wrong while add billing');
      }
    }, error => {
      console.log('error', error);
      this.toastService.showToast(error)
      loading.then((l) => l.dismiss());
    })
  }

}
