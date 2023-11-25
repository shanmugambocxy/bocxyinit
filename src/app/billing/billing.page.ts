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
      this.totalProductAmount = _.sumBy(data, 'price');

      // this.grandTotal = this.totalProductAmount
      // this.subTotal = this.totalProductAmount;
    } else {
      data = [];
    }
    if (type == '1') {
      this.id = Number(id);
      this.getAppointmentDetails(this.id);
    } else {
      this.subTotal = this.totalProductAmount;
      this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      this.cash_paid_amount = this.grandTotal;
      console.log('individualproduct', this.grandTotal);

    }

  }
  ionViewWillEnter() {
    debugger
    console.log('productlist', this.productlist);
    console.log('will enter');
  }

  deleteProduct(item: any) {
    debugger
    this.productlist = this.productlist.filter(x => x.id != item.id)
    if (this.productlist) {
      localStorage.setItem('listOfProducts', JSON.stringify(this.productlist));
      this.totalProductAmount = _.sumBy(this.productlist, 'price');
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
        this.subTotal = this.appointment.totalPriceExpected + this.totalProductAmount;
        this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.cash_paid_amount = this.grandTotal;
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
        this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        this.cash_paid_amount = this.grandTotal;
        this.card_paid_amount = 0;
        this.upi_paid_amount = 0;
      }
    } else {
      this.discount = this.byValue;
      this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
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
    if (value) {
      getValue = JSON.parse(value);
    }
    this.card_paid_amount = Math.abs(this.grandTotal - getValue - this.upi_paid_amount);
    this.upi_paid_amount = Math.abs(this.grandTotal - getValue - this.card_paid_amount);
    console.log('balance', this.balanceAmount);
  }
  cardAmountChange(event: any) {
    debugger
    let value = event.target.value;
    let getValue: number = 0;
    if (value) {
      getValue = JSON.parse(value);
    }
    this.cash_paid_amount = Math.abs(this.grandTotal - getValue - this.upi_paid_amount);
    this.upi_paid_amount = Math.abs(this.grandTotal - getValue - this.cash_paid_amount);
  }
  UPIAmountChange(event: any) {
    debugger
    let value = event.target.value;
    let getValue: number = 0;
    if (value) {
      getValue = JSON.parse(value);
    }
    this.cash_paid_amount = Math.abs(this.grandTotal - getValue - this.card_paid_amount);
    this.card_paid_amount = Math.abs(this.grandTotal - getValue - this.cash_paid_amount);

  }
  addTipChange() {
    console.log('tip', this.addTip);
    this.grandTotal = (this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
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
    this.router.navigate(['receipt', { billid: data, productId: 1, type: 1 }]);
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
    // const loading = this.loadingCtrl.create();
    // loading.then((l) => l.present());
    var uuid = uuidv4();
    console.log('uuid', uuid);
    var merchantStoreId = localStorage.getItem('merchant_store_id');
    let pageType: any;
    if (this.type == '1') {
      pageType = "Service & Products"
    } else {
      pageType = "Products"

    }
    var modeOfPayment: any;
    modeOfPayment = `${this.cash_paid_amount > 0 ? 'Cash' : ''}${this.card_paid_amount > 0 || this.upi_paid_amount > 0 ? ',' : ''} ${this.card_paid_amount > 0 ? 'Card' : ''} ${this.upi_paid_amount > 0 ? ',' : ''} ${this.upi_paid_amount > 0 ? 'UPI' : ''} `
    console.log('modeOfPayment', modeOfPayment);

    // if (this.cash_paid_amount > 0) {
    //   modeOfPayment = 'Cash'
    // }
    // if(this.card_paid_amount){
    //   modeOfPayment = 'Card'
    // }
    // if(this.upi_paid_amount){
    //   modeOfPayment = 'UPI'
    // }
    if (this.paymentMode == 'Cash') {
      if (!this.payableAmount) {
        this.toastService.showToast('please enter the paid amount');
        return
      }
      if (this.payableAmount < this.grandTotal) {
        this.toastService.showToast("required payable amount is" + ' ' + this.grandTotal + ' ' + "but paid amount is" + ' ' + this.payableAmount);
        return
      }
    }
    let toDaydate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    console.log('date', toDaydate);
    var gender: any;
    var productlist = []
    if (this.productlist && this.productlist.length > 0) {
      gender = this.productlist[0].gender;
      for (let i = 0; i < this.productlist.length; i++) {
        let data = {
          product_name: this.productlist[0].product_name,
          quantity: JSON.stringify(this.productlist[0].quantity),
          price: this.productlist[0].price,
          staff: this.productlist[0].staff
        }
        productlist.push(data);
      }
    } else {
      gender = '';
    }
    let data = {
      "amount": JSON.stringify(this.subTotal),
      "paid": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "created_by": 1,
      "updated_by": 1,
      "discount": this.discount ? JSON.stringify(this.discount) : '0',
      // "gitvoucher": this.redeemVoucher ? JSON.parse(this.redeemVoucher) : 0,
      "gitvoucher": "",
      // "modeofpayment": this.paymentMode,
      "subtotal": JSON.stringify(this.subTotal),
      "tips": JSON.stringify(this.addTip),
      "SGST": JSON.stringify(this.subTotal * this.SGST),
      "CGST": JSON.stringify(this.subTotal * this.CGST),
      "Grandtotal": JSON.stringify(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0) - (this.redeemVoucher ? this.redeemVoucher : 0)),
      "paidAmount": this.payableAmount ? JSON.stringify(this.payableAmount) : '',
      "merchantStoreId": merchantStoreId ? merchantStoreId : 0,
      "name": this.appointment ? this.appointment.customerName : this.singleProducts ? this.singleProducts.userName : '',
      "phoneno": this.appointment ? this.appointment.customerMobile : this.singleProducts ? this.singleProducts.mobilenumber : '',
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
      "modeofpayment": modeOfPayment,
      "type": pageType,
      "cash_paid_amount": this.cash_paid_amount ? JSON.stringify(this.cash_paid_amount) : "0",
      "card_paid_amount": this.card_paid_amount ? JSON.stringify(this.card_paid_amount) : "0",
      "upi_paid_amount": this.upi_paid_amount ? JSON.stringify(this.upi_paid_amount) : "0",
    }
    console.log('save_billing', data);
    this.appointmentListService.saveBilling(data).subscribe((res) => {
      console.log('res', res);
      // loading.then((l) => l.dismiss());
      if (res && res.billId) {
        // this.next();
        if (this.type == "1") {
          this.appointmentListService.updateBilingstatus(this.appointment.appointmentId).subscribe(res => {
            if (res) {
              this.gotoReceipt(this.appointment ? this.appointment.bookingId : uuid ? uuid : '');
            }
          })
        } else {
          this.gotoReceipt(uuid ? uuid : '');
        }
      }
      else {
        this.toastService.showToast('something went wrong while add billing')
      }
      // this.gotoReceipt(52);
      this.gotoReceipt(this.appointment ? this.appointment.bookingId : uuid ? uuid : '');


    })
    // } else {
    //   this.toastService.showToast('please select the payment mode')

    // }

  }

}
