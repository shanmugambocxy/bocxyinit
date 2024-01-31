import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { ToastService } from '../_services/toast.service';
import { AccountSettingsService } from '../accountsettings/accountsettings.service';
@Component({
  selector: 'app-customerbillpage',
  templateUrl: './customerbillpage.page.html',
  styleUrls: ['./customerbillpage.page.scss'],
})
export class CustomerbillpagePage implements OnInit {
  @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
  productList: any = [];
  serviceList: any = [];
  // receiptLabel: any = [{ name: "ITEM" }, { name: "PRICE" }, { name: "QTY" }, { name: "DISCOUNT" }, { name: "TAX" }, { name: "TOTAL" },]
  receiptLabel: any = [{ name: "ITEM" }, { name: "PRICE" }, { name: "QTY" }, { name: "DISCOUNT" }, { name: "TOTAL" },]

  receiptValue: any = [{ name: "Anti Hairfall Treatment(Member)" }, { name: "₹1000.00" }, { name: "1" }, { name: "₹0.00" }, { name: "₹ 180.00" }, { name: "₹ 1,180.00" },]

  paymentLabel: any = [{ name: "PAYMENT MODE" }, { name: "AMOUNT" }, { name: "DATE" }, { name: "STATUS" }]
  paymentValue: any = [{ name: "Cash" }, { name: "₹ 1180.00" }, { name: "04 Nov 2023 10.06 AM" }, { name: "Success" }];
  id: any;
  receiptDetails: any;
  customerName: any;
  email: any;
  paramSubscription: Subscription;
  totalAmount: number = 0;
  grandTotalAmount: number = 0;
  merchantStoreId: any;
  accountData: any;


  constructor(public modalController: ModalController,
    private httpService: DetailAppointmentService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toast: ToastService,
    public alertController: AlertController,
    private menu: MenuController,
    private accountSettingsService: AccountSettingsService,
  ) { }

  ngOnInit() {
    this.paramSubscription = this.route.params.subscribe(
      async (params: Params) => {
        // tslint:disable-next-line: no-string-literal
        if (params['id']) {
          this.id = params.id;
        } else {
          // this.toast.showToast('Something went wrong. Please try again');
        }
        if (params['email']) {
          this.email = params.email;
        } else {
          // this.toast.showToast('Something went wrong. Please try again');
        }
        this.getRecieptData();
        // this.sendToEmail();
      });
  }

  ionViewWillEnter() {

    this.accountSettingsService.getCurrentUserAccountForMerchant().subscribe((accountData: any) => {
      if (accountData.status === 'SUCCESS') {
        this.accountData = accountData.data;

      } else {
        this.accountData = '';

      }
    })

    this.menu.swipeGesture(false);
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
  }

  getRecieptData() {
    this.receiptDetails = {};
    var productTotal: number = 0;
    var productGrandTotal: number = 0;
    var serviceTotal: number = 0;
    var serviceGrandTotal: number = 0;
    const loading = this.loadingCtrl.create();
    this.httpService.getReportsProductDetails(this.id).subscribe(res => {
      if (res.data.length > 0) {
        this.receiptDetails = res.data[0];
        this.customerName = res.data[0].customer_name;
        if (res.data[0].products && res.data[0].products.length > 0) {

          // res.data[0].products.forEach(element => {
          //   if (element.discount && element.discount != null && element.discount != '' && element.discount != '0') {
          //     let totalprice = (element.Quantity && element.Quantity != null && element.Quantity != '' && element.Quantity != '0' ? element.Quantity : 1) * element.Price;
          //     let discountValue = (totalprice * element.discount) / 100;
          //     // let discountValue = (getDiscount / 100) / service.price;
          //     element.discountValue = discountValue;
          //     element.discountAmount = Math.round(totalprice - discountValue);
          //     // element.totalPrice = (element.Price *(element.Quantity && element.Quantity != null && element.Quantity != '' && element.Quantity != '0' ? element.Quantity : 1)) - element.discountAmount;
          //     element.totalPrice = (element.Price * (element.Quantity && element.Quantity != null && element.Quantity != '' && element.Quantity != '0' ? element.Quantity : 1)) - element.discountValue;

          //   } else {
          //     // element.discountAmount = 0;
          //     element.discountValue = 0;
          //     element.totalPrice = element.Price * (element.Quantity && element.Quantity != null && element.Quantity != '' && element.Quantity != '0' ? element.Quantity : 1);
          //   }
          // });
          let productList = [];
          productList = res.data[0].products;
          this.receiptDetails.products = productList;
          this.productList = this.receiptDetails.products;



          // this.productList = res.data[0].products;

        } else {
          this.productList = [];
        }
      }
      this.httpService.getReportsServiceDetails(this.id).subscribe(res => {
        loading.then((l) => l.dismiss());
        if (res && res.data.length > 0) {
          if (res.data[0].bookedServices.length > 0) {
            // res.data[0].bookedServices.forEach(element => {
            // if (element.discount && element.discount != null && element.discount != '' && element.discount != '0') {
            //   let totalprice = element.quantity * element.price;
            //   let discountValue = (totalprice * element.discount) / 100;
            //   element.discountAmount = Math.round(totalprice - discountValue);
            //   element.totalPrice = (element.price * element.quantity) - element.discountAmount;
            // } else {
            //   element.discountAmount = 0;
            //   element.totalPrice = element.price * (element.quantity && element.quantity != null && element.quantity != '' ? element.quantity : 1);
            // }

            // if (element.discount && element.discount != null && element.discount != '' && element.discount != '0') {
            //   let totalprice = (element.quantity && element.quantity != null && element.quantity != '' && element.quantity != '0' ? element.quantity : 1) * element.price;
            //   let discountValue = (totalprice * element.discount) / 100;
            //   element.discountValue = discountValue;
            //   element.discountAmount = Math.round(totalprice - discountValue);
            //   element.totalPrice = (element.price * (element.quantity && element.quantity != null && element.quantity != '' && element.quantity != '0' ? element.quantity : 1)) - discountValue;
            // } else {
            //   element.discountValue = 0;
            //   element.totalPrice = element.price * (element.quantity && element.quantity != null && element.quantity != '' && element.quantity != '0' ? element.quantity : 1);
            // }
            // });
            let serviceList = [];
            serviceList = res.data[0].bookedServices;
            this.receiptDetails.bookedServices = serviceList;
            this.serviceList = this.receiptDetails.bookedServices;
          }
          // this.receiptDetails.bookedServices = res.data[0].bookedServices;
          // this.serviceList = res.data[0].bookedServices;
          // console.log('receiptDetails', this.receiptDetails);

        }
      })
    })
  }


  forReview() {
    // let url = "https://www.google.com/maps/place//data=!4m3!3m2!1s0x26524e3704e76763:0x641ef0b4062bb41b!12e1?source=g.page.m.ia._&laa=nmx-review-solicitation-ia2"
    let url = this.accountData.GoogleReview;

    window.open(url, "_blank");
  }
  generatePDF(divRef) {
    let images = divRef.getElementsByTagName('img');

    // console.log(images[0].src);

    //    doc.addImage('https://via.placeholder.com/150');
    // console.log(divRef);
    // const div = document.getElementById('print-paper');
    html2canvas(divRef)
      .then((successRef) => {
        var doc = new jsPDF('p', 'mm', 'a4');
        var img = successRef.toDataURL('image/png');

        // Add image Canvas to PDF
        const bufferX = 5;
        const bufferY = 5;
        const imgProps = (<any>doc).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 4 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((doc) => doc.save('Receipt.pdf'));
  }

  saveAsPDF() {
    // html2canvas(document.querySelector('#divRef'), { height: 1800, width: window.innerWidth * 2, scale: 1 }).then(canvas => {
    //   const dataURL = canvas.toDataURL();
    //   const pdf = new jsPDF();
    //   pdf.addImage(dataURL, 'JPEG', 0, 0);
    //   pdf.save('Sample Charts.pdf');
    // });
  }
  sendToEmail() {
    let data = {
      email: this.email,
      // path: `receipt/${this.id}/${this.email}`

      path: `customerbillpage/${this.id}/${this.email}`
    }
    this.httpService.sendReceiptThroughEmail(data).subscribe((res) => {
      if (res) {
        this.toast.showToast("Email Sent Successfully")
      }
    })
  }
  sendToWhatssapp() {
    let phoneno = this.receiptDetails.phoneno.substring(1);
    var trimNumber: any;
    if (phoneno) {
      trimNumber = phoneno.replace(/ /g, '');
    }
    console.log('trimPhoneNo', trimNumber);
    debugger
    var text2: any;
    if (this.receiptDetails.Sublocality) {
      text2 = this.receiptDetails.Store_name + '-' + this.receiptDetails.Sublocality;
    } else {
      text2 = this.receiptDetails.Store_name;

    }
    let sendWhatsappdata = {
      "receiverNumber": trimNumber,
      "text1": this.receiptDetails.Grandtotal,
      "text2": text2,
      "text3": `customerbillpage/${this.id}/${this.email}`
    }
    this.httpService.sendToWhatsapp(sendWhatsappdata).subscribe((res) => {
      if (res) {
        this.toast.showToast('receipt as sent to whatsapp number');
      }
    })
  }
  async presentCancelAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Send To Email',
      message: 'please enter the valid email for invoice?',
      inputs: [
        {
          name: 'Reason',
          type: 'textarea',
          placeholder: 'enter email',
          cssClass: 'alertTextBox'
        }],
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: (no) => {
            // this.appointment.status = this.lastStatus;
            // console.log('cancel Canceled!');
          },
        },
        {
          text: 'Yes',
          cssClass: 'secondary',
          handler: async (data) => {
            debugger
            // this.cancelReason = data.Reason;
            if (data.Reason) {
              this.email = data.Reason;
              this.sendToEmail()

            }
          },
        },
      ]
    });

    await alert.present();



  }

}
