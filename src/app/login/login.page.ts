import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { MenuController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from '../_services/toast.service';
import { Storage } from '@ionic/storage';
import { AuthService } from '../_services/auth.service';
import { SharedService } from '../_services/shared.service';
import { AccountSecurityQuestions } from '../forgotpw/forgotpw.model';
import { AccountService } from '../_services/account.service';
import { HardBackService } from '../_services/hardback.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FcmService } from '../_services/fcm.service';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// declare var require: any;
// const easyinvoice = require('easyinvoice');


// var easyinvoice = require('easyinvoice');
// var fs = require('fs');

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [Keyboard]
})
export class LoginPage implements OnInit {
  @ViewChild('ngTelInput')

  ngTelInput: ElementRef;
  isKeyboardHide = true;
  telInputOptions = { initialCountry: 'in', onlyCountries: ['in'] };
  mobileNumber: number;
  dialCode: string;
  countryCode = 'in';
  public loginForm: FormGroup;
  formSubmitted: boolean;
  mobileNumErr: boolean;
  activeErr: boolean;
  passwordErr: boolean;
  storeApproval: boolean;
  // receipt
  receiptLabel: any = [{ name: "ITEM" }, { name: "PRICE" }, { name: "QTY" }, { name: "DISCOUNT" }, { name: "TAX" }, { name: "TOTAL" },]
  receiptValue: any = [{ name: "Anti Hairfall Treatment(Member)" }, { name: "₹1000.00" }, { name: "1" }, { name: "₹0.00" }, { name: "₹ 180.00" }, { name: "₹ 1,180.00" },]
  paymentLabel: any = [{ name: "PAYMENT MODE" }, { name: "AMOUNT" }, { name: "DATE" }, { name: "STATUS" }]
  paymentValue: any = [{ name: "Cash" }, { name: "₹ 1180.00" }, { name: "04 Nov 2023 10.06 AM" }, { name: "Success" }]
  imgSRC = 'https://d1mo3tzxttab3n.cloudfront.net/static/img/toni-and-guy-og-image.jpg'
  @ViewChild('divRef', { static: false }) contentToConvert: ElementRef;
  invoiceData: any; // Define your invoice data here

  constructor(
    public keyboard: Keyboard,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toast: ToastService,
    private storage: Storage,
    private authService: AuthService,
    private sharedService: SharedService,
    private alertCtrl: AlertController,
    private hardBackService: HardBackService,
    public translate: TranslateService,
    public translateModule: TranslateModule,
    private fcm: FcmService
  ) {
    this.invoiceData = {
      documentTitle: 'Invoice',
      currency: 'USD',
      taxNotation: 'vat',
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: 'https://www.example.com/logo.png',
      sender: {
        company: 'Your Company',
        address: '123 Main Street',
        zip: '12345',
        city: 'City',
        country: 'Country'
      },
      client: {
        company: 'Client Company',
        address: '456 Client Street',
        zip: '54321',
        city: 'Client City',
        country: 'Client Country'
      },
      invoiceNumber: 'INV-001',
      invoiceDate: '2023-01-01',
      products: [
        {
          quantity: 2,
          description: 'Product 1',
          tax: 12.5,
          price: 10
        },
        {
          quantity: 1,
          description: 'Product 2',
          tax: 12.5,
          price: 20
        }
      ],
      bottomNotice: 'Thank you for your business!'
    };
  }

  ionViewWillEnter() {
    // the left menu should be disabled on the login page
    this.menuCtrl.enable(false);
    this.keyboard.onKeyboardWillShow().subscribe(() => {
      this.isKeyboardHide = false;
      // console.log('SHOWK');
    });
    this.keyboard.onKeyboardWillHide().subscribe(() => {
      this.isKeyboardHide = true;
      // console.log('HIDEK');
    });
  }
  ionViewWillLeave() {
    // enable the left menu when leaving the login page
    this.menuCtrl.enable(true);
  }

  async generatePDF2(): Promise<void> {
    try {
      // const blob = await this.authService.generateInvoice(this.invoiceData);

      // // Open the PDF in a new window or download it
      // const url = URL.createObjectURL(blob);
      // window.open(url, '_blank');

    } catch (error) {
      console.error('Error generating PDF', error);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      mobileNumber: [null, Validators.compose([
        Validators.required
      ])],
      password: [null, Validators.compose([
        Validators.required
      ])],
    });

    // BackToExit
    // this.hardBackService.backToExit();
  }
  hasError(obj) {
    if (!this.loginForm.get('mobileNumber').getError('required')) {
      if (!obj) {
        this.loginForm.get('mobileNumber').setErrors({ invalid_cell_phone: true });
      }
    }
  }
  getNumber(obj) {
    this.mobileNumber = this.loginForm.value.mobileNumber ? typeof (this.loginForm.value.mobileNumber) === 'number' ? this.loginForm.value.mobileNumber : Number((this.loginForm.value.mobileNumber).replace(' ', '')) : null;
    // this.mobileNumber = Number(this.loginForm.value.mobileNumber);
    const n = obj.indexOf(this.mobileNumber);
    this.dialCode = obj.substr(0, n);
  }
  onCountryChange(obj) {
    this.countryCode = obj.iso2;
  }
  telInputObject(obj) {
    obj.setCountry(this.countryCode);
  }
  changePhone() {
    this.ngTelInput.nativeElement.blur();
    this.ngTelInput.nativeElement.focus();
    this.typeChange('mobileNum');
  }
  numberValidate(evt) {
    const theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    const regex = /[0-9]/;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) {
        theEvent.preventDefault();
      }
    }
  }
  typeChange(field: string) {
    if (field === 'mobileNum') {
      this.mobileNumErr = false;
      this.activeErr = false;
      this.storeApproval = false;
    }
    this.passwordErr = false;
  }
  login() {
    debugger
    this.formSubmitted = true;
    if (this.loginForm.valid) {

      const loading = this.loadingCtrl.create();
      loading.then(l => l.present());
      const mobilenum = this.mobileNumber;
      const password = this.loginForm.value.password;
      console.log(mobilenum, password);
      this.authService.login(mobilenum, this.dialCode, password)
        .subscribe(
          async (response) => {
            if (response && response.status === 'SUCCESS') {
              this.sharedService.changeAuthTokenCheck(response.data.accessToken);
              // localStorage.setItem('merchant_store_id', JSON.stringify(response.data.merchant_store_id));
              localStorage.setItem('merchant_store_id', response.data.merchant_store_id);


              await this.storage.set('accessToken', response.data.accessToken);
              const authVal = await this.authService.isLoggedIn();
              this.authService.getAccount().subscribe(async data => {
                if (response && response.status === 'SUCCESS') {
                  // let dummyVal: any = data.data;
                  // dummyVal.permissions = [  "APPOINTMENT_BILLING",
                  // "REVENUE_STATUS",
                  // "SERVICE_MANAGEMENT",
                  // "STYLIST_MANAGEMENT",
                  // "STYLIST_SLOT_CONFIGURATION",
                  // "BANNERS_MANAGEMENT",
                  // "STORE_TIME_MANAGEMENT",
                  // "CUSTOMER_MANAGEMENT",
                  // "EXPENSE_MANAGEMENT",
                  // "ANNOUNCEMENT_MANAGEMENT"];
                  // await this.storage.set('userData', dummyVal);
                  // console.log("userd:"+this.storage.get('userData'));
                  await this.storage.set('userData', data.data);
                  // await this.storage.set('currentLocation', {
                  //   region: data.data.agencyRegion,
                  //   latitude: data.data.latitude,
                  //   longitude: data.data.longitude
                  // });
                  this.sharedService.changeLoginCheck(authVal);
                  this.sharedService.changeProfileCheck(1);
                  this.fcm.getToken();
                  loading.then(l => l.dismiss());
                  if (data.data.roleCodes.includes('MR')) {
                    await this.storage.set('firstLogin', response.data.firstlogValue);
                    if (response.data.firstlogValue === 'Y') {
                      this.navCtrl.navigateRoot('/slotduration');
                    } else {
                      this.navCtrl.navigateRoot('/home');
                    }
                  } else {
                    await this.storage.set('firstLogin', 'N');
                    this.navCtrl.navigateRoot('/home');
                  }
                }
              });
              this.mobileNumErr = false;
              this.activeErr = false;
              this.passwordErr = false;
              this.storeApproval = false;
            } else {
              loading.then(l => l.dismiss());
              if (response) {
                if (response.data.username) {
                  this.mobileNumErr = true;
                } else if (response.data.signupFlag) {
                  this.partialSignupPrompt();
                } else if (response.data.activeFlag) {
                  this.activeErr = true;
                } else if (response.data.password) {
                  this.passwordErr = true;
                } else if (response.data.storeApproval) {
                  this.storeApproval = true;
                }

                // to be remove
                // if (response.data.activeFlag && response.data.password) {
                //   if (response.data.data === 'Account not exist') {
                //     this.mobileNumErr = true;
                //   } else {
                //     this.activeErr = true;
                //   }
                // } else if (response.data.password) {
                //   this.passwordErr = true;
                // } else {
                //   this.toast.showToast();
                // }
                // to be remove

              } else {
                this.toast.showToast();
              }
            }
          }, async err => {
            loading.then(l => l.dismiss());
            this.toast.showToast();
          }
        );
    }
  }
  async partialSignupPrompt() {
    const alert = await this.alertCtrl.create({
      header: 'Info!',
      message: 'Partial signup detected on this account! Please signup again.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Okay',
          handler: () => {
            this.navCtrl.navigateRoot('/signup');
          }
        }
      ]
    });
    await alert.present();
  }


  generatePDF(divRef) {
    let images = divRef.getElementsByTagName('img');

    // console.log(images[0].src);

    //    doc.addImage('https://via.placeholder.com/150');
    // console.log(divRef);
    // const div = document.getElementById('print-paper');
    html2canvas(divRef)
      .then((successRef) => {
        // const opt = {
        //   margin: [0, 0],
        //   filename: 'myfile.pdf',
        //   image: { type: 'jpeg', quality: 0.98 },
        //   html2canvas: { dpi: 192, letterRendering: true },
        //   jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        // };
        var doc = new jsPDF('p', 'mm', 'a4');

        // var doc = new jsPDF(opt.jsPDF);
        var img = successRef.toDataURL('image/png');

        // Add image Canvas to PDF
        const bufferX = 5;
        const bufferY = 5;
        const imgProps = (<any>doc).getImageProperties(img);
        // const pdfWidth = doc.internal.pageSize.getWidth() - 4 * bufferX;
        // const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pdfWidth = doc.internal.pageSize.width;
        const pdfHeight = doc.internal.pageSize.height;
        console.log('width', pdfWidth);
        console.log('width', pdfHeight);


        doc.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);


        // doc.addImage(
        //   img,
        //   'PNG',
        //   bufferX,
        //   bufferY,
        //   pdfWidth,
        //   pdfHeight,
        //   undefined,
        //   'FAST'
        // );
        return doc;

      })
      .then((doc) => doc.save('Receipt.pdf'));
  }

  generatePDF3(): void {
    const content = this.contentToConvert.nativeElement;

    // Use html2canvas to capture the content
    html2canvas(content).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.width;
      const pdfHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(5);
      // Calculate the number of pages based on the content height
      const contentHeight = canvas.height;
      const totalPages = Math.ceil(contentHeight / pdfHeight);

      // Loop through each page and add a portion of the content
      for (let i = 0; i < totalPages; i++) {
        const startY = -i * pdfHeight;

        // Use a new canvas for each page
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = Math.min(pdfHeight, contentHeight - i * pdfHeight);

        // Draw a portion of the content to the new canvas
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, startY, canvas.width, canvas.height);

        // Convert the new canvas to base64 image
        const imgData = newCanvas.toDataURL('image/png');

        // Add the image to the PDF
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      // Download the PDF

      pdf.save('generated-pdf.pdf');
    });
  }

}
