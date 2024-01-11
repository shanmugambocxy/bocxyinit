import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NavController, LoadingController, ModalController, AlertController } from '@ionic/angular';
import { Location, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tab3Servcie } from './tab3.service';
import { AppointmentBooking } from './tab3Booking.model';
import { Stylist } from './stylist.model';
import { TimeSlot } from './timeSlot.model';
import { MerchantService } from './merchantService.model';
import { ToastService } from '../_services/toast.service';
import { SharedService } from '../_services/shared.service';
import { AppointmentServicePage } from '../appointmentservice/appointmentservice.page';
import { Time } from './tab3.model';
import { database } from 'firebase';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Router } from '@angular/router';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';
import { AppointmentproductsPage } from '../appointmentproducts/appointmentproducts.page';
import * as _ from 'lodash';
import { MerchantCustomerServices } from '../tab4/tab4.service';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  providers: [Keyboard]
})

export class Tab3Page implements OnInit {
  @ViewChild('ngTelInput')
  ngTelInput: ElementRef;
  isKeyboardHide = true;
  selectedIndex: any;
  selectedTimeIndex: any;
  stylistButtonColor = '';
  appointmentForm: FormGroup;
  productForm: FormGroup;

  contactNumber: number;
  dialCode: string;
  countryCode = 'in';
  telInputOptions = { initialCountry: 'in', onlyCountries: ['in'] };
  datebuttons: { date: string, name: string }[];
  appointmentBooking: AppointmentBooking;
  stylists: Stylist[];
  selectedStylistIndex: number;
  timeslots: TimeSlot[];
  formSubmitted: boolean;
  merchantServiceList: MerchantService[];
  isPickDateError: boolean;
  isStylistError: boolean;
  isSlotSelectionError: boolean;
  disableBookingBtn: boolean;
  slotDuration: number;
  storeDuration: any;
  serviceCost: number;
  emptySlotDuration: boolean;
  emptyStylist: boolean;
  refreshSubscription = new Subject();
  checked: boolean;
  quantity: number = 0;
  price: number = 0;
  allProducts: any[];
  products: any[];
  genterTypeList: any = [{ id: 1, name: "male" }, { id: 2, name: "female" }, { id: 3, name: "others" }];
  staffList: any = [{ id: 1, name: "tom" }, { id: 2, name: "binladen" }, { id: 3, name: "staff" }];

  selectedProduct: any;
  selectedGender: any;
  merchantStoreId: any;
  productlist: any = [];
  totalProductAmount: number = 0;
  Visited: any = [];
  allVisited: any = [];
  allVisitedService: any = [];

  constructor(
    public modalController: ModalController,
    public keyboard: Keyboard,
    public navCtrl: NavController,
    private location: Location,
    private formBuilder: FormBuilder,
    private tab3Service: Tab3Servcie,
    private loadingCtrl: LoadingController,
    private toast: ToastService,
    private sharedService: SharedService,
    private nh: NavigationHandler,
    private router: Router,
    private httpService: AppointmentServiceService,
    public alertController: AlertController,
    private merchantcustomerservices: MerchantCustomerServices,
  ) {
  }

  async ngOnInit() {
    this.init();

    this.sharedService.currentAppointmentBookingDateRefresh.pipe(takeUntil(this.refreshSubscription)).subscribe(async data => {
      this.getAppointmentDates();
      this.clearNullValues();
      this.getStylistList();
    });
    this.appointmentBooking = new AppointmentBooking();
    this.disableBookingBtn = false;
    await this.getMerchantProduct();

  }

  OnDateSelect(dateString, index) {

    this.isPickDateError = false;
    // if (this.selectedIndex !== index) {
    this.selectedIndex = index;
    const date = new Date(dateString);
    this.appointmentBooking.bookingDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    // this.appointmentBooking.bookingDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}${' ' + date.getHours().toString().padStart(2, '0')}${':' + date.getDate().toString().padStart(2, '0')}`;
    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    this.tab3Service.GetDateSlots(this.appointmentBooking.merchantStoreServiceId, this.appointmentBooking.bookingDate).subscribe(
      async (response) => {
        loading.then(l => l.dismiss());
        if (response.status === 'SUCCESS') {
          if (response.data.stylists && response.data.stylists.length > 0) {
            this.storeDuration = { openingTime: response.data.openingTime, closingTime: response.data.closingTime };
            this.emptyStylist = false;
            this.stylists = response.data.stylists;
            // this.stylists.unshift({ professionistAccountId: 0, firstName: 'Any' });
            this.generateSlots();
            // if (this.appointmentBooking.stylistAccountId != null) {
            //   this.OnStylistSelect(this.appointmentBooking.stylistAccountId, this.selectedStylistIndex);
            // }
            this.selectedStylistIndex = null;
            this.appointmentBooking.stylistAccountId = null;
            this.selectedTimeIndex = null;
            this.appointmentBooking.slotStartTime = null;
            this.appointmentBooking.slotEndTime = null;
          }
          else {
            this.stylists = [];
            this.emptyStylist = true;
            this.emptySlotDuration = false;
          }
        }
        else {
          this.toast.showToast('Something went wrong, Please try again');
        }
      }
    );
    this.clearTimeSelect();
    // }
  }

  OnStylistSelect(stylistId, i) {
    this.isStylistError = false;
    // if (this.selectedStylistIndex !== i) {
    this.selectedStylistIndex = i;
    this.appointmentBooking.stylistAccountId = stylistId;
    const loading = this.loadingCtrl.create();

    loading.then(l => l.present());
    const stylistSlots = this.tab3Service.GetStylistSlots(
      this.appointmentBooking.stylistAccountId,
      this.appointmentBooking.bookingDate
    ).subscribe(
      async (response) => {
        loading.then(l => l.dismiss());
        if (response.status === 'SUCCESS') {
          const data = response.data;
          this.clearTimeSelect();
          const slotDurationSeconds = this.slotDuration * 60;
          for (const stylistSlot of data.bookedSlots) {
            const stylistStart = new Time(stylistSlot.slotStartTime);
            const stylistEnd = new Time(stylistSlot.slotEndTime);
            const stylistStartSeconds = stylistStart.getTotalSeconds();
            const stylistEndSeconds = stylistEnd.getTotalSeconds();
            for (const slot of this.timeslots) {
              if (!slot.isDisabled) {
                const slotTime = new Time(slot.slotName);
                const slotSeconds = slotTime.getTotalSeconds();
                const startDifference = stylistStartSeconds - slotSeconds;
                if (startDifference === 0 || (startDifference > 0 && startDifference < slotDurationSeconds)) {
                  slot.isDisabled = true;
                }
                else if ((slotTime.isGreaterThan(stylistStart) || slotTime.isEqual(stylistStart)) && slotTime.isLessThan(stylistEnd)) {
                  slot.isDisabled = true;
                }
                else {
                  slot.isDisabled = false;
                }
              }
            }
          }

          const date = new Date();
          const currentDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
          let datePipe = new DatePipe('en-US');
          const currentTime = datePipe.transform(date, 'H:mm:ss');
          if (data.bookedSlots.length === 0) {
            for (const slot of this.timeslots) {
              if (this.appointmentBooking.bookingDate === currentDate && new Time(slot.slotName).isLessThan(new Time(currentTime))) {
                slot.isDisabled = true;
              }
              else {
                slot.isDisabled = false;
              }
            }
          }
          else {
            for (const slot of this.timeslots) {
              if (this.appointmentBooking.bookingDate === currentDate && new Time(slot.slotName).isLessThan(new Time(currentTime))) {
                slot.isDisabled = true;
              }
            }
          }

          if (data.availability && data.availability.length > 0) {
            const selectedSlots = [];
            for (const ava of data.availability) {
              const startTime = new Time(ava.startTime);
              const endTime = new Time(ava.endTime);
              for (const slot of this.timeslots) {
                const slotTime = new Time(slot.slotName);
                if (slotTime.isEqual(startTime) || (slotTime.isGreaterThan(startTime) && slotTime.isLessThan(endTime))) {
                  selectedSlots.push(slot.slotName);
                }
              }
            }

            for (const slot of this.timeslots) {
              let isSelectedSlot = false;
              if (slot.isDisabled === null || slot.isDisabled === false) {
                for (const ava of selectedSlots) {
                  if (slot.slotName === ava) {
                    isSelectedSlot = true;
                    break;
                  }
                }
                if (isSelectedSlot === false) {
                  slot.isDisabled = true;
                }
              }
            }
          }
        }
        else {
          this.toast.showToast('Something went wrong, Please try again');
        }
      }
    );
    // }
  }
  clearTimeSelect() {
    this.selectedTimeIndex = -1;
    this.appointmentBooking.slotStartTime = null;
    this.appointmentBooking.slotEndTime = null;
  }

  OnTimeSlotSelect(slotTime, index) {
    this.isSlotSelectionError = false;
    this.selectedTimeIndex = index;
    const startTime = new Time(slotTime);
    this.appointmentBooking.slotStartTime = startTime.toString();
    this.appointmentBooking.slotEndTime = startTime.addMinutes(this.slotDuration).subtractSeconds(1).toString();
  }
  init() {
    debugger
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
    this.appointmentForm = this.formBuilder.group({
      userName: [null, Validators.compose([Validators.required])],
      contactNumber: [null, Validators.compose([Validators.required])],
      // service: [{ value: null, disabled: true }, Validators.compose([Validators.required])]
      service: [null, Validators.compose([Validators.required])]

    });
    if (this.merchantStoreId != '61') {
      this.productForm = this.formBuilder.group({
        userName: ['', Validators.required],
        mobilenumber: [null, Validators.required],
        // product: [null, Validators.required],
        // qty: [null, Validators.required],
        // gender: [null, Validators.required],
        staff: [null, Validators.required]
      });
    } else {
      this.productForm = this.formBuilder.group({
        userName: ['', Validators.required],
        mobilenumber: [null, Validators.required],
        // product: [null, Validators.required],
        // qty: [null, Validators.required],
        // gender: [],
        staff: [null, Validators.required]
      });
      // this.productForm.controls['gender'].clearValidators();
    }

    this.productlist = [];
    this.allVisitedService = [];
    this.allVisited = [];
    this.Visited = [];
    this.allVisited = [];
  }
  ionViewWillEnter() {
    this.init();
    this.getVisitedCustomers();


    localStorage.removeItem('listOfProducts');
    localStorage.removeItem('individualProducts');

    // let merchantStoreId = localStorage.getItem('merchant_store_id');
    // console.log('merchantStoreId', merchantStoreId);
    // this.merchantStoreId = merchantStoreId ? merchantStoreId : '';


    this.keyboard.onKeyboardWillShow().subscribe(() => {
      this.isKeyboardHide = false;
      // console.log('SHOWK');
    });

    this.keyboard.onKeyboardWillHide().subscribe(() => {
      this.isKeyboardHide = true;
      // console.log('HIDEK');
    });
  }

  async showBookingConfirmation(message = null, value = null) {
    const price = value ? value : this.serviceCost;
    this.OnBooking(price);
    // const alert = await this.alertController.create({
    //   cssClass: 'my-custom-class',
    //   header: 'Confirm Booking',
    //   subHeader: 'Service cost',
    //   message: message,
    //   inputs: [{
    //     name: 'price',
    //     label: 'Service Cost',
    //     placeholder: 'Service cost',
    //     value: price,
    //     type: 'number',
    //     min: 1,
    //     max: 999999999
    //   }],
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       role: 'cancel',
    //       handler: (no) => {
    //         console.log('Booking Canceled!');
    //       },
    //     },
    //     {
    //       text: 'Book Now',
    //       role: 'yes',
    //       cssClass: 'secondary',
    //       handler: async (data) => {
    //         price = data.price;
    //         if (price && price > 0) {
    //           this.OnBooking(price);
    //           alert.dismiss(true);
    //           return true;
    //         }
    //         else {
    //           alert.dismiss(false);
    //           return false;
    //         }
    //       },
    //     },
    //   ]
    // });
    // await alert.present();
    // alert.onDidDismiss().then(async (data) => {
    //   if (data.role !== 'cancel' && (!data.data.values.price || data.data.values.price <= 0)) {
    //     await this.showBookingConfirmation('Please enter valid servcie cost', data.data.values.price);
    //   }
    // });
  }

  getMerchantProduct() {
    let storeId = localStorage.getItem('store_admin_id');

    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    return new Promise((res, rej) => {
      // let data = {
      //   "type": "inventory",
      //   "storeId": "651d0aec391e55ce6109ce5b"
      // }
      //working
      //"652ac589fb1d72ce6584dc31"

      let data = {
        "type": "Instore",
        "storeId": storeId
      }

      // let data = {
      //   "type": "Instore",
      //   "storeId": "657bf86368e06dd908f1e4997722"
      // }
      // let data = {
      //   "type": "Instore",
      //   "storeId": "657c077c3546d08ea2706e9f"
      // }
      // let data = {
      //   "type": "Instore",
      //   "storeId": "651d0aec391e55ce6109ce5b"
      // }
      this.httpService.getInventoryProducts(data).subscribe(response => {

        loading.then(l => l.dismiss());
        if (response && response.data.length > 1) {
          this.products = response.data;

          this.allProducts = this.products;

        } else if (response && response.data) {
          this.products = [response.data];

          this.allProducts = this.products;
        } else {
          // this.toast.showToast("Something went wrong. Please try again");
        }
        res(true);
      }, async err => {
        rej(err);
      });
    });
  }

  getVisitedCustomers() {
    debugger
    return new Promise((resolve, reject) => {
      // this.pageVisited = 1;
      // this.errorMessage = undefined;
      // this.merchantcustomerservices.getVisitedCustomers({ page: 1 }).subscribe(data => {
      let merchantId = this.merchantStoreId ? JSON.parse(this.merchantStoreId) : 0;
      this.merchantcustomerservices.getCustomers(merchantId).subscribe((data: any) => {

        if (data) {
          this.Visited = [];
          if (data.length > 0) {
            data.forEach(element => {
              element.searchMobileNo = '';
              if (element.phoneno && element.phoneno != '') {
                let numericPart = (element.phoneno.replace(/\D/g, '')).slice(2);
                element.searchMobileNo = numericPart ? numericPart : "";
                element.dialcode = element.phoneno.slice(0, 3)
                // element.searchMobileNo = element.phoneno;
              }
            });
            this.Visited = data;
            this.allVisited = [];

          }
          // if (data.data.length > 0) {

          //   data.data.forEach(element => {
          //     element.searchMobileNo = JSON.stringify(element.mobileNo)
          //   })
          //   this.Visited = data.data;
          //   console.log('Visited', this.Visited);

          //   this.allVisited = [];
          // }
          // this.allVisited = this.Visited;
          // this.perPageVisited = data.perPage;
          // this.totalDataVisited = data.totalCount;
          // this.totalPageVisited = data.totalPages;

        } else {
          // this.errorMessage = 'Failed to load data';
          this.Visited = [];
          this.allVisited = this.Visited;

        }
        resolve(1);
      }, error => {
        // this.errorMessage = (error as any);
        this.Visited = [];
        this.allVisited = this.Visited;

        reject(error);
      });
    });
  }

  OnBooking(manualPrice: number) {
    debugger
    this.disableBookingBtn = true;
    this.formSubmitted = true;
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    if (this.appointmentForm.valid && this.ValidateAppointmentForm()) {
      this.appointmentBooking.customerName = this.appointmentForm.value.userName.trim();
      this.appointmentBooking.customerMobile = this.appointmentForm.value.contactNumber;
      this.appointmentBooking.customerMobileCountry = this.countryCode.toUpperCase();
      this.appointmentBooking.customerMobileCode = this.dialCode;
      this.appointmentBooking.stylistAccountId = this.appointmentBooking.stylistAccountId === 0 ? null :
        this.appointmentBooking.stylistAccountId;
      this.appointmentBooking.type = 'WALKIN';
      this.appointmentBooking.manualPrice = manualPrice;
      this.appointmentBooking.uniqueStoreId = merchantStoreId;
      this.appointmentBooking.quantity = 1;
      this.appointmentBooking.discount = 0;
      this.appointmentBooking.discountamount = 0;
      this.appointmentBooking.totalprice = manualPrice;
      const loading = this.loadingCtrl.create();
      loading.then(l => l.present());
      this.tab3Service.BookAppointment(this.appointmentBooking).subscribe(
        (response) => {
          loading.then(l => l.dismiss());
          if (response && response.status === 'SUCCESS') {
            if (response.data.bookedFlag) {
              this.datebuttons.push();
              this.appointmentBooking.slotStartTime = null;
              this.appointmentBooking.slotEndTime = null;
              this.selectedTimeIndex = null;
              if (!this.appointmentBooking.stylistAccountId) {
                this.appointmentBooking.stylistAccountId = 0;
              }
              this.OnDateSelect(this.appointmentBooking.bookingDate, this.selectedIndex);
              this.toast.showToast('Selected Slot is already booked. Please select other slot.');
              this.disableBookingBtn = false;
            }
            else {
              this.sharedService.changeAppointmentMannualRefresh(1);
              this.toast.showToast('Appointment booked');
              this.nh.GoBackTo('/home/tabs/tab1');
              this.formSubmitted = false;
              this.disableBookingBtn = false;
              this.appointmentBooking = new AppointmentBooking();
              this.appointmentForm.get('userName').setValue(null);
              this.appointmentForm.get('contactNumber').setValue(null);
              this.appointmentForm.get('service').setValue(null);
              this.selectedIndex = null;
              this.selectedStylistIndex = null;
              this.selectedTimeIndex = null;
            }
          }
          else {
            this.toast.showToast('Something went wrong, Please try again');
            this.disableBookingBtn = false;
          }
        }
      );


    }
    else {
      this.disableBookingBtn = false;
    }

  }

  selectProduct() {
    this.quantity = 1;
  }
  onkeyUp(event) {
    debugger


  }
  onQuantityChange(event) {
    let getQuantity = JSON.parse(event.detail.value);
    this.quantity = getQuantity;
    let price = 100;
    this.price = this.quantity * price;

  }
  incrementQty() {
    debugger
    if (this.selectedProduct && this.selectedProduct.quantity) {
      if (this.quantity < this.selectedProduct.quantity) {
        this.quantity += 1;
        this.price = this.quantity * this.selectedProduct.discountPrice;
      } else {
        this.toast.showToast("Increment Quantity Exceed.")
      }
    }
  }
  decrementQty() {
    if (this.quantity > 0) {
      this.quantity -= 1;
      // let price = 100;
      this.price = this.quantity * this.selectedProduct.discountPrice;
      // this.price = this.quantity * price;

    }

  }

  async showMerchantProductModal() {
    this.allVisited = [];
    this.allVisitedService = [];
    const modal = await this.modalController.create({
      component: AppointmentproductsPage,
      cssClass: 'my-custom-class-product',
      componentProps: {
        type: 1,
      }
    });
    modal.onWillDismiss().then(response => {
      if (response) {
        let data: any = [];
        let getData = JSON.parse(localStorage.getItem('listOfProducts'))
        if (getData && getData.length > 0) {
          getData.forEach((element, index) => {
            element.id = index + 1;
            // if (element.choosediscount && element.choosediscount != null && element.choosediscount != '') {
            //   let discount = element.choosediscount ? JSON.parse(element.choosediscount) : 0;
            //   element.choosediscount = discount;
            // } else {
            //   element.discount = 0;
            // }
          });
          data = getData;
        } else {
          data = [];
        }
        this.productlist = data;
        this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');

      }

    });
    return await modal.present();
  }
  onChangeGender(event: any) {
  }
  productConfirmation() {

    if (this.productForm.valid) {
      // this.appointmentBooking.customerName = this.appointmentForm.value.userName.trim();
      // this.appointmentBooking.customerMobile = this.appointmentForm.value.contactNumber;
      // this.appointmentBooking.customerMobileCountry = this.countryCode.toUpperCase();
      // this.appointmentBooking.customerMobileCode = this.dialCode;
      // this.appointmentBooking.stylistAccountId = this.appointmentBooking.stylistAccountId === 0 ? null :
      //   this.appointmentBooking.stylistAccountId;
      // this.appointmentBooking.type = 'WALKIN';
      const loading = this.loadingCtrl.create();
      loading.then(l => l.present());
      // this.tab3Service.BookAppointment(this.appointmentBooking).subscribe(
      //   (response) => {
      //     loading.then(l => l.dismiss());
      //     if (response && response.status === 'SUCCESS') {
      //       if (response.data.bookedFlag) {
      //         this.datebuttons.push();
      //         this.appointmentBooking.slotStartTime = null;
      //         this.appointmentBooking.slotEndTime = null;
      //         this.selectedTimeIndex = null;
      //         if (!this.appointmentBooking.stylistAccountId) {
      //           this.appointmentBooking.stylistAccountId = 0;
      //         }
      //         this.OnDateSelect(this.appointmentBooking.bookingDate, this.selectedIndex);
      //         this.toast.showToast('Selected Slot is already booked. Please select other slot.');
      //         this.disableBookingBtn = false;
      //       }
      //       else {
      //         this.sharedService.changeAppointmentMannualRefresh(1);
      //         this.toast.showToast('Appointment booked');
      //         this.nh.GoBackTo('/home/tabs/tab1');
      //         this.formSubmitted = false;
      //         this.disableBookingBtn = false;
      //         this.appointmentBooking = new AppointmentBooking();
      //         this.appointmentForm.get('userName').setValue(null);
      //         this.appointmentForm.get('contactNumber').setValue(null);
      //         this.appointmentForm.get('service').setValue(null);
      //         this.selectedIndex = null;
      //         this.selectedStylistIndex = null;
      //         this.selectedTimeIndex = null;
      //       }
      //     }
      //     else {
      //       this.toast.showToast('Something went wrong, Please try again');
      //       this.disableBookingBtn = false;
      //     }
      //   }
      // );


    }
    else {
      this.disableBookingBtn = false;
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
              // this.deleteService(item)

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
    this.productlist = this.productlist.filter(x => x.id != item.id)
    if (this.productlist) {
      localStorage.setItem('listOfProducts', JSON.stringify(this.productlist));
      this.totalProductAmount = _.sumBy(this.productlist, 'totalprice');
    }

  }

  productSave() {
    debugger
    // if (this.merchantStoreId == '61') {
    //   this.productForm.controls['gender'].clearValidators();
    //   this.productForm.controls['gender'].updateValueAndValidity();
    // }
    if (this.productForm.valid) {
      if (this.productlist.length > 0) {
        let productData = {
          customerName: this.productForm.value.userName,
          mobilenumber: '+91' + ' ' + this.productForm.value.mobilenumber,
          // gender: this.productForm.value.gender,
          staff: this.productForm.value.staff.firstName,
          staff_Id: this.productForm.value.staff.accountId
        }
        localStorage.setItem('individualProducts', JSON.stringify(productData));
        this.router.navigate(['billing', { id: 0, type: 2 }]);
      } else {
        this.toast.showToast("please select the product.")
      }
    } else {
      this.productForm.markAllAsTouched();
    }
    // if (this.quantity > 0) {
    //   let productData = {
    //     userName: this.productForm.value.userName,
    //     mobilenumber: this.productForm.value.mobilenumber,
    //     productName: this.productForm.value.product,
    //     qty: this.quantity,
    //     price: this.price,
    //     gender: this.productForm.value.gender
    //   }
    //   console.log('form', this.productForm.value);

    //   localStorage.setItem('selectedProducts', JSON.stringify(productData));
    //   // this.previous();
    // }
    // if (this.productForm.value.product) {
    //   if (this.quantity > 0) {
    //     let productData = {
    //       // productName: this.productForm.value.product,
    //       // qty: this.quantity,
    //       // price: this.price,
    //       // gender: this.productForm.value.gender
    //       customerName: this.productForm.value.userName,
    //       mobilenumber: this.productForm.value.mobilenumber,
    //       product_name: this.productForm.value.product,
    //       quantity: this.quantity,
    //       price: this.price,
    //       gender: this.productForm.value.gender,
    //       staff: this.productForm.value.staff
    //     }
    //     // let listOfProducts: any = [];
    //     // listOfProducts.push(productData);
    //     // console.log('listOfProducts', listOfProducts);
    //     let data: any = [];
    //     let getData = JSON.parse(localStorage.getItem('listOfProducts'))
    //     if (getData) {
    //       data = getData
    //     } else {
    //       data = [];
    //     }
    //     data.push(productData);
    //     localStorage.setItem('listOfProducts', JSON.stringify(data));
    //     localStorage.setItem('selectedProducts', JSON.stringify(productData));
    //     console.log('listOfProducts', data);
    //     // this.router.navigate(['billing']);
    //     this.router.navigate(['billing', { id: 0, type: 2 }]);

    //   } else {
    //     this.toast.showToast("please select the product.")
    //   }
    // } else {
    //   this.toast.showToast("please select the product.")
    // }
  }

  userNameValidate(event) {
    // tslint:disable-next-line: deprecation
    const theEvent = event || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    const regex = /^[a-zA-Z_ ]*$/i;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) {
        theEvent.preventDefault();
      }
    }
    this.allVisited = [];
    this.allVisitedService = [];
    // const val = event.target.value;
    // console.log('allVisited', this.allVisited);
    // debugger
    // if (val && val.trim() !== '') {
    //   return this.allVisited.filter(val => val.indexOf(val)) >= 0;

    //   // this.allVisited = this.allVisited.filter((ser) => {
    //   //   // return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1);
    //   //   // return (ser.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1);
    //   // });
    // }
    // this.filterCustomer(event)
  }

  hasError(obj) {
    if (!this.appointmentForm.get('contactNumber').getError('required')) {
      if (!obj) {
        this.appointmentForm.get('contactNumber').setErrors({ invalid_cell_phone: true });
      }
    }


  }

  getNumber(obj) {
    this.contactNumber = this.appointmentForm.value.contactNumber ?
      typeof (this.appointmentForm.value.contactNumber) === 'number' ? this.appointmentForm.value.contactNumber :
        Number((this.appointmentForm.value.contactNumber).replace(' ', '')) : null;
    // this.contactNumber = Number(this.appointmentForm.value.contactNumber);
    const n = obj.indexOf(this.contactNumber);
    this.dialCode = obj.substr(0, n);
  }

  onCountryChange(obj) {
    this.countryCode = obj.iso2;
  }

  telInputObject(obj) {
    obj.setCountry(this.countryCode);
  }

  numberValidate(evt) {
    // tslint:disable-next-line: deprecation
    debugger
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
    // const val = evt.target.value;
    debugger
    // if (val && val.trim() !== '') {
    //   this.allVisited = this.Visited.filter((ser) => {
    //     // return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1);
    //     return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1);


    //   });
    //   // this.allVisited = this.Visited.filter((element) => {
    //   //   return element.searchMobileNo.toLowerCase() == val.toLowerCase();
    //   // });
    // }


    // console.log('allVisited', this.allVisited);


  }
  filterCustomer(event: any) {
    const val = event.target.value;
    if (val && val.trim() !== '') {
      this.allVisited = this.Visited.filter((ser) => {
        // return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1);
        return (ser.phoneno.toLowerCase().indexOf(val.toLowerCase()) > -1);


        // return (ser.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.allVisited = [];
    }
  }
  filterCustomerService(event: any) {
    debugger
    const val = event.target.value;

    if (val && val.trim() !== '') {
      this.allVisitedService = this.Visited.filter((ser) => {
        return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1);
        // return (ser.phoneno.toLowerCase().indexOf(val.toLowerCase()) > -1);


        // return (ser.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.allVisitedService = [];
    }

  }
  updateCustomerDetails(customer: any) {
    this.productForm.controls['userName'].setValue(customer.name);
    this.productForm.controls['mobilenumber'].setValue(customer.searchMobileNo);
    this.allVisited = [];


  }
  updateCustomerDetailsService(customer: any) {
    debugger

    this.appointmentForm.controls['userName'].setValue(customer.name);
    this.appointmentForm.controls['contactNumber'].setValue(customer.searchMobileNo);
    this.allVisitedService = [];
    this.dialCode = customer.dialcode;


  }

  changePhone() {

    this.ngTelInput.nativeElement.blur();
    this.ngTelInput.nativeElement.focus();

  }

  previous() {
    this.location.back();
    this.formSubmitted = false;
    this.disableBookingBtn = false;
    this.appointmentBooking = new AppointmentBooking();
    this.appointmentForm.get('userName').setValue(null);
    this.appointmentForm.get('contactNumber').setValue(null);
    this.appointmentForm.get('service').setValue(null);
    this.selectedIndex = null;
    this.selectedStylistIndex = null;
    this.selectedTimeIndex = null;
  }

  async showMerchantServiceModal() {

    this.allVisited = [];
    this.allVisitedService = [];
    const modal = await this.modalController.create({
      component: AppointmentServicePage,
      cssClass: 'my-custom-class',
    });
    modal.onWillDismiss().then(response => {
      if (response.data) {
        const service = (response.data) as MerchantService;
        this.appointmentBooking.merchantStoreServiceId = service.merchantStoreServiceId;
        this.appointmentForm.get('service').setValue(service.name);
        this.onServiceChange(service.merchantStoreServiceId);

      }
    });
    return await modal.present();
  }

  getAppointmentDates() {
    this.tab3Service.GetAppointmentDate().subscribe(
      async (response) => {
        if (response.status === 'SUCCESS') {
          this.datebuttons = [];
          for (const dateString of response.data) {
            const date = new Date(dateString);
            this.datebuttons.push({ date: dateString, name: date.toLocaleString('en-IN', { day: 'numeric', month: 'short' }) });
          }
        }
        else {
          this.toast.showToast('Something went wrong, Please try again');
        }
      }
    );
  }

  getStylistList() {
    this.tab3Service.GetStylistList().subscribe(
      async (response) => {
        if (response.status === 'SUCCESS') {
          // this.stylists = response.data;
          this.staffList = response.data;
          // this.stylists.unshift({ professionistAccountId: 0, firstName: 'Any' });
        }
        else {
          this.toast.showToast('Something went wrong, Please try again');
        }
      }
    );
  }

  ValidateAppointmentForm(): boolean {
    if (!this.appointmentBooking.bookingDate) {
      this.isPickDateError = true;
      return false;
    }
    if (!this.appointmentBooking.stylistAccountId && this.appointmentBooking.stylistAccountId !== 0) {
      this.isStylistError = true;
      return false;
    }
    if (!this.appointmentBooking.slotStartTime) {
      this.isSlotSelectionError = true;
      return false;
    }

    return true;
  }

  onServiceChange(id: number) {
    if (id) {
      this.tab3Service.GetStylistByService(id).subscribe(
        async (response) => {
          if (response.status === 'SUCCESS') {

            this.emptyStylist = false;
            // this.stylists = response.data.stylists;
            // this.stylists.unshift({ professionistAccountId: 0, firstName: 'Any' });
            this.slotDuration = response.data.slotDuration;
            if (!this.slotDuration || this.slotDuration === 0) {
              this.emptySlotDuration = true;
            }
            else {
              this.emptySlotDuration = false;
            }
            this.serviceCost = response.data.price;
            this.selectedStylistIndex = null;
            this.appointmentBooking.stylistAccountId = null;
            this.selectedTimeIndex = null;
            this.appointmentBooking.slotStartTime = null;
            this.appointmentBooking.slotEndTime = null;
            this.generateSlots();


          }
          else {
            this.toast.showToast('Something went wrong, Please try again');
          }
        }
      );
    }
  }
  clearNullValues() {
    this.formSubmitted = false;
    this.disableBookingBtn = false;
    this.appointmentBooking = new AppointmentBooking();
    if (this.appointmentForm) {
      this.appointmentForm.get('userName').setValue(null);
      this.appointmentForm.get('contactNumber').setValue(null);
      this.appointmentForm.get('service').setValue(null);
    }

    if (this.productForm) {
      this.productForm.get('userName').setValue(null);
      this.productForm.get('mobilenumber').setValue(null);
      // this.productForm.get('product').setValue(null);
      // this.productForm.get('qty').setValue(null);
      // this.productForm.get('gender').setValue(null);
      this.productForm.get('staff').setValue(null);
      this.price = 0;
      this.quantity = 0;
    }
    if (this.merchantStoreId == '61') {
      // this.productForm.controls['gender'].clearValidators();

    }
    this.selectedIndex = null;
    this.selectedStylistIndex = null;
    this.selectedTimeIndex = null;
  }
  generateSlots() {
    if (this.storeDuration && this.slotDuration && this.slotDuration > 0) {
      const openTime = new Time(this.storeDuration.openingTime);
      const closeTime = new Time(this.storeDuration.closingTime);
      const iteration = (closeTime.getTotalMinutes() - openTime.getTotalMinutes()) / this.slotDuration;
      const tempTime = openTime;
      this.timeslots = [];

      this.timeslots.push({ slotName: tempTime.toShortTimeString() });
      for (let i = 1; i < iteration; i++) {
        this.timeslots.push({ slotName: tempTime.addMinutes(this.slotDuration).toShortTimeString() });
      }
    }
  }

  ngOnDestroy() {
    this.refreshSubscription.next();
    this.refreshSubscription.unsubscribe();
  }

  toggleChange() {
    // this.clearNullValues();
    this.appointmentForm = this.formBuilder.group({
      userName: [null, Validators.compose([Validators.required])],
      contactNumber: [null, Validators.compose([Validators.required])],
      // service: [{ value: null, disabled: true }, Validators.compose([Validators.required])]
      service: [null, Validators.compose([Validators.required])]

    });
    this.productForm = this.formBuilder.group({
      userName: [null, Validators.required],
      mobilenumber: [null, Validators.required],
      // product: [null, Validators.required],
      // qty: [null, Validators.required],
      // gender: [null, Validators.required],
      staff: [null, Validators.required]
    });
    this.productlist = [];
    this.allVisitedService = [];
    this.allVisited = [];
    this.checked = !this.checked;
  }
  onChangeStaff(event: any) {
    this.allVisited = [];
    this.allVisitedService = [];
  }
}

