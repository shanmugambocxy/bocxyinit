import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from "@angular/common";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { AddAnotherServiceService } from './addanotherservice.service';
import { AppointmentServicePage } from '../appointmentservice/appointmentservice.page';
import { LoadingController, ModalController, AlertController, IonSelect } from '@ionic/angular';
import { MerchantProduct, MerchantService } from '../tab3/merchantService.model';
import { ServiceDetails } from './addanotherservice.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Stylist } from '../tab1/tab1.model';
import { ToastService } from '../_services/toast.service';
import { SharedService } from '../_services/shared.service';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { AppointmentproductsPage } from '../appointmentproducts/appointmentproducts.page';
import { StylistManagementService } from '../stylistmgmt/stylistmgmt.service';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-addanotherservice',
  templateUrl: './addanotherservice.page.html',
  styleUrls: ['./addanotherservice.page.scss'],
})
export class AddanotherservicePage implements OnInit {
  isService: boolean = false;
  productForm: FormGroup;
  productList: any = [];
  quantity: number = 0;
  price: number = 0;
  selectedProduct: any;
  selectedGender: any;
  genterTypeList: any = [{ id: 1, name: "male" }, { id: 2, name: "female" }, { id: 3, name: "others" }];
  staffList: any = [{ id: 1, name: "tom" }, { id: 2, name: "binladen" }, { id: 3, name: "staff" }];
  allProducts: any[];
  products: any[];
  type: any;
  page: any;
  productlist: any = [];
  totalProductAmount: number = 0;
  services: MerchantService[];
  allServices: MerchantService[];
  allServicelist: any[];
  stylistAccountId: number;
  @ViewChild('mySelect') mySelect: IonSelect;


  constructor(
    private location: Location,
    public route: ActivatedRoute,
    private httpService: AddAnotherServiceService,
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private toast: ToastService,
    private loadingCtrl: LoadingController,
    public nav: NavigationHandler,
    private sharedService: SharedService,
    private appointmentServiceService: AppointmentServiceService,
    public alertController: AlertController,
    private appointmentService: AppointmentServiceService,


  ) { }

  paramSubscription: Subscription;
  serviceDetails: ServiceDetails;
  serviceForm: FormGroup;
  stylistList: Stylist[];
  formSubmitted: boolean;
  disableSaveBtn: boolean;
  merchantStoreId: any;

  ngOnInit() {
    localStorage.removeItem('selectedProducts');
    this.formSubmitted = false;
    this.disableSaveBtn = false;
    this.paramSubscription = this.route.params.subscribe(
      async (params: Params) => {
        console.log('params', params);

        if (params['appointmentId']) {
          this.serviceDetails = new ServiceDetails();
          this.serviceDetails.appointment_id = Number(params['appointmentId']);

        }

        if (params['type']) {
          let type = Number(params['type']);
          let page = Number(params['page']);
          let accountId = Number(params['accountId']);
          this.type = type;
          this.page = page;
          if (accountId) {
            this.stylistAccountId = accountId;
          }
          if (this.type == 1) {
            this.isService = true;
            this.getStylistList();
            await this.getMerchantService(accountId);
            // await this.getStylistList();
          } else {
            this.getStylistList();
            await this.getMerchantProduct();
            this.isService = false;
            // this.productList = [{
            //   'key': 1,
            //   'value': 'fashwash cream'
            // },
            // {
            //   'key': 2,
            //   'value': 'hair gel'
            // }]

          }
          console.log('type', this.type);

        }
      });
    this.serviceForm = this.formBuilder.group({
      // service: [null, Validators.compose([Validators.required])],
      // stylist: [null]
      service: [null],
      stylist: [null]
    });
    this.productForm = this.formBuilder.group({
      // product: [null, Validators.compose([Validators.required])],
      // qty: [null],
      gender: [],
      staff: [null, Validators.required]
    });

  }
  selectOption(event: any, select: IonSelect, service: any): void {
    debugger
    service.professionist_account_id = event.detail.value;
    // // Get the selected value
    // const selectedValue = event.detail.value;

    // // Do something with the selected value (e.g., update a variable)
    // console.log('Selected Option:', selectedValue);

    // // Close the select component programmatically
    // // select.close();
    // select.value = selectedValue;
    // if (select && select.open) {
    //   select.ionChange; // Close the popup
    // }
  }
  ionViewWillEnter() {
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
  }

  getMerchantService(accountId) {
    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    return new Promise((res, rej) => {
      this.appointmentService.getMerchantServices().subscribe(response => {
        loading.then(l => l.dismiss());
        if (response && response.status === 'SUCCESS') {
          response.data.forEach(element => {
            element.choosequantity = 0;
            element.price = element.price;
            element.totalprice = element.choosequantity * element.price;
            element.checked = false;
            element.choosediscount = 0;
            element.discountAmount = 0;
            element.chooseprice = 0;
            // element.professionist_account_id = accountId;
          })
          this.services = this.allServices = response.data;
          console.log('service', this.services);

        } else {
          this.toast.showToast("Something went wrong. Please try again");
        }
        res(true);
      }, async err => {
        rej(err);
      });
    });
  }


  async showMerchantServiceModal() {
    const modal = await this.modalController.create({
      component: AppointmentServicePage,
      cssClass: 'my-custom-class',
    });
    modal.onWillDismiss().then(response => {
      if (response.data) {
        const service = (response.data) as MerchantService;
        this.serviceDetails.merchant_store_service_id = service.merchantStoreServiceId;
        this.serviceForm.get('service').setValue(service.name);
      }
    });
    return await modal.present();
  }

  getStylistList() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.httpService.getProfessionalList().subscribe((response) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.stylistList = response.data;
        this.staffList = response.data;
      }
      else {
        this.toast.showToast('Something went wrong. Please try again');
      }
    });
  }

  addService() {
    debugger
    this.formSubmitted = true;
    this.disableSaveBtn = true;
    if (this.serviceForm.valid) {
      let selectedService = [];
      selectedService = this.services.filter(x => x.checked);
      if (selectedService && selectedService.length > 0) {
        let multiService = [];
        selectedService.forEach(element => {
          let selectedService = {
            "appointment_id": this.serviceDetails.appointment_id,
            "merchant_store_service_id": element.merchantStoreServiceId,
            "professionist_account_id": element.professionist_account_id,
            "quantity": element.choosequantity,
            "discount": element.discountAmount,
            "price": element.price
            // "discount": element.choosediscount


          }
          multiService.push(selectedService)
        });
        this.httpService.addMultiService(multiService).subscribe((response) => {
          if (response && response.status === 'SUCCESS') {
            let totalExistingServicePrice = this.sharedService.totalPriceExpected
            let totalExtraServicePrice = _.sumBy(selectedService, 'price');
            let data = {
              appointment_id: this.serviceDetails.appointment_id,
              totalamount: (totalExistingServicePrice + totalExtraServicePrice)
            }
            this.httpService.addTotalpriceExpected(data).subscribe(addtotal => {
              if (addtotal && addtotal.status === 'SUCCESS') {
                this.sharedService.changeAppointmentMannualRefresh(1);
                this.sharedService.changeNewappointmentListReferesh(1);
                this.sharedService.changeUpcomingAppointmentListReferesh(1);
                this.sharedService.changeWalkinAppointmentReferesh(1);
                this.previous();

              } else {
                this.toast.showToast('problem occured while adding service');
              }



            })
          }
          else {
            this.toast.showToast('Something went wrong. Please try again');
            this.disableSaveBtn = false;
          }
        });
      } else {
        // let listOfService = selectedService;
        // localStorage.setItem('listOfService', JSON.stringify(listOfService));
        this.toast.showToast('please select the service');
        // this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

      }
    }

    // if (this.serviceForm.valid) {
    //   this.serviceDetails.professionist_account_id = this.serviceForm.value.stylist;
    //   const loading = this.loadingCtrl.create();
    //   loading.then((l) => l.present());
    //   this.httpService.addService(this.serviceDetails).subscribe((response) => {
    //     loading.then((l) => l.dismiss());
    //     if (response && response.status === 'SUCCESS') {
    //       this.previous();
    //     }
    //     else {
    //       this.toast.showToast('Something went wrong. Please try again');
    //       this.disableSaveBtn = false;
    //     }
    //   });
    // }
    // else {
    //   this.disableSaveBtn = false;
    // }

  }


  // async showMerchantProductModal() {
  //   const modal = await this.modalController.create({
  //     component: AppointmentproductsPage,
  //     cssClass: 'my-custom-class',
  //   });
  //   modal.onWillDismiss().then(response => {
  //     if (response.data) {
  //       console.log('productpopup', response.data);
  //       const product = response.data.selectedProduct;
  //       this.selectedProduct = product;
  //       // this.serviceDetails.merchant_store_service_id = product.merchantProductId;
  //       this.productForm.get('product').setValue(product.productName);
  //       if (this.productForm.value.product) {
  //         this.quantity = 1;
  //         this.price = this.quantity * product.discountPrice;

  //       } else {
  //         this.quantity = 0;
  //       }

  //     }
  //   });
  //   return await modal.present();
  // }

  async showMerchantProductModal() {

    const modal = await this.modalController.create({
      component: AppointmentproductsPage,
      cssClass: 'my-custom-class-product',
    });
    modal.onWillDismiss().then(response => {
      if (response) {
        let data: any = [];
        let getData = JSON.parse(localStorage.getItem('listOfProducts'))
        if (getData && getData.length > 0) {
          getData.forEach((element, index) => {
            element.id = index + 1
          });
          data = getData;
        } else {
          data = [];
        }
        this.productlist = data;
        this.totalProductAmount = _.sumBy(data, 'totalprice');
        console.log('productlist', this.productlist);
        console.log('will enter');
      }
      // if (response.data) {
      //   console.log('productpopup', response.data);
      //   const product = response.data.selectedProduct;
      //   this.selectedProduct = product;
      //   this.productForm.get('product').setValue(product.productName);
      //   if (this.productForm.value.product) {
      //     this.quantity = 1;
      //     this.price = this.quantity * product.discountPrice;
      //   } else {
      //     this.quantity = 0;
      //   }
      // }
    });
    return await modal.present();
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
  addProducts() {
    this.formSubmitted = true;
    this.disableSaveBtn = true;
    if (this.productForm.valid) {
      // this.serviceDetails.professionist_account_id = this.serviceForm.value.stylist;
      // const loading = this.loadingCtrl.create();
      // loading.then((l) => l.present());
      // this.httpService.addService(this.serviceDetails).subscribe((response) => {
      //   loading.then((l) => l.dismiss());
      //   if (response && response.status === 'SUCCESS') {
      //     this.previous();
      //   }
      //   else {
      //     this.toast.showToast('Something went wrong. Please try again');
      //     this.disableSaveBtn = false;
      //   }
      // });
    }
    else {
      this.disableSaveBtn = false;
    }
  }

  // incrementQty() {
  //   debugger
  //   if (this.selectedProduct && this.selectedProduct.quantity) {
  //     if (this.quantity < this.selectedProduct.quantity) {
  //       this.quantity += 1;
  //       // let price = 100;
  //       this.price = this.quantity * this.selectedProduct.discountPrice;
  //     } else {
  //       this.toast.showToast("Increment Quantity Exceed.")
  //     }
  //   }


  // }
  // decrementQty() {
  //   if (this.quantity > 0) {
  //     this.quantity -= 1;
  //     // let price = 100;

  //     this.price = this.quantity * this.selectedProduct.discountPrice;

  //   }

  // }
  getMerchantProduct() {
    let storeId = localStorage.getItem('store_admin_id');

    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    return new Promise((res, rej) => {
      // let data = {
      //   "type": "inventory",
      //   "storeId": "651d0aec391e55ce6109ce5b"
      // }
      // 652ac589fb1d72ce6584dc31
      //working
      // let data = {
      //   "type": "Instore",
      //   "storeId": "652ac589fb1d72ce6584dc31"
      // }
      let data = {
        "type": "Instore",
        "storeId": storeId
      }
      // // let data = {
      // //   "type": "Instore",
      // //   "storeId": "657bf86368e06dd908f1e4997722"
      // // }
      // // let data = {
      // //   "type": "Instore",
      // //   "storeId": "657c077c3546d08ea2706e9f"
      // // }
      // let data = {
      //   "type": "Instore",
      //   "storeId": "651d0aec391e55ce6109ce5b"
      // }


      this.appointmentServiceService.getInventoryProducts(data).subscribe(response => {
        console.log('responsse Product', response);
        loading.then(l => l.dismiss());
        if (response && response.data.length > 0) {
          this.products = response.data;
          this.products.forEach(element => {
            element.choosequantity = 0;
            element.totalprice = element.choosequantity * element.discountPrice;
            element.totalPriceValue = 'Rs.' + element.totalprice;
            element.checked = false;
            element.choosediscount = 0;
          })
          this.allProducts = this.products;
          console.log('products1', this.products);
        } else if (response && response.data) {
          // this.products = [response.data];
          // this.allProducts = this.products;
          // console.log('products2', this.products);
          this.products = [];
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

  incrementQty(product: any) {
    debugger
    // if (this.selectedProduct && this.selectedProduct.quantity) {
    if (product.checked) {

      if (product.choosequantity < product.quantity) {
        product.choosequantity += 1;
        // let price = 100;
        product.totalprice = product.choosequantity * product.discountPrice;
        product.totalPriceValue = 'Rs.' + product.totalprice;
      } else {
        this.toast.showToast("Increment Quantity Exceed.");
      }
    } else {
      this.toast.showToast("Please select the product.");
    }
    // }


  }
  decrementQty(product: any) {
    debugger
    if (product.choosequantity > 1) {
      product.choosequantity -= 1;
      // let price = 100;

      product.totalprice = product.choosequantity * product.discountPrice;
      product.totalPriceValue = 'Rs.' + product.totalprice;

    }

  }
  incrementQtyService(service: any) {
    if (service.checked) {

      if (service.choosequantity < service.quantity) {
        service.choosequantity += 1;
        // let price = 100;
        service.totalprice = service.choosequantity * service.discountPrice;
        service.totalPriceValue = 'Rs.' + service.totalprice;
      } else {
        this.toast.showToast("Increment Quantity Exceed.");
      }
    } else {
      this.toast.showToast("Please select the product.");
    }
  }
  decrementQtyService(service: any) {
    if (service.choosequantity > 1) {
      service.choosequantity -= 1;
      // let price = 100;

      service.totalprice = service.choosequantity * service.discountPrice;
      service.totalPriceValue = 'Rs.' + service.totalprice;

    }
  }
  selectProduct(product: any) {
    product.checked = !product.checked;
    if (product.checked) {
      product.choosequantity = 1;
      product.totalprice = product.choosequantity * product.discountPrice;
    } else {
      product.choosequantity = 0;
      product.totalprice = product.choosequantity * product.discountPrice;
    }
  }
  productMultiSave() {
    // product.checked
    debugger
    // let selectedProducts = [];
    // selectedProducts = this.products.filter(x => x.checked);
    // let data: any = [];
    // let getData = JSON.parse(localStorage.getItem('listOfProducts'))
    // if (getData) {
    //   data = getData;
    // } else {
    //   data = [];
    // }
    // if (data && data.length > 0) {
    //   let listOfProducts = data.concate(selectedProducts);
    //   localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
    //   this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    // } else {
    //   let listOfProducts = selectedProducts;
    //   localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
    //   this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    // }

    if (this.merchantStoreId == '61') {
      this.productForm.controls['gender'].clearValidators();
      this.productForm.controls['gender'].updateValueAndValidity();
    }
    if (this.productForm.valid) {
      if (this.productlist.length > 0) {
        // let productData = {
        //   customerName: this.productForm.value.userName,
        //   mobilenumber: this.productForm.value.mobilenumber,
        //   gender: this.productForm.value.gender,
        //   staff: this.productForm.value.staff.firstName,
        //   staff_Id: this.productForm.value.staff.accountId
        // }

        let staff = this.productForm.value.staff;
        // console.log('event', event.detail.value);
        // this.productList.forEach(element => {
        //   element.staff = staff.firstName;
        //   element.staff_Id = staff.accountId
        // });

        this.productlist.forEach(element => {
          element.staff = staff.firstName;
          element.staff_Id = staff.accountId;
        });
        let listOfProducts = this.productlist;
        localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
        this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

        // this.router.navigate(['billing', { id: 0, type: 2 }]);
      } else {

        this.toast.showToast("please select the product.")
      }
    } else {
      this.productForm.markAllAsTouched();
    }


  }
  selectService(service: any) {
    debugger
    service.checked = !service.checked;
    // service.merchantStoreServiceId=service.
    if (service.checked) {
      service.choosequantity = 1;
      service.totalprice = service.choosequantity * service.price;
      service.professionist_account_id = this.stylistAccountId;
    } else {
      service.choosequantity = 0;
      service.totalprice = service.choosequantity * service.price;
      service.professionist_account_id = 0;

    }
  }

  // filterservice(ev: any) {
  //   this.products = this.allProducts;
  //   const val = ev.target.value;
  //   if (val && val.trim() !== '') {
  //     // this.products = this.products.filter((ser) => {
  //     //   return (ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
  //     // });
  //     this.products = this.products.filter((ser) => {
  //       return (ser.productName.toLowerCase().indexOf(val.toLowerCase()) > -1);
  //     });

  //   }
  // }

  filterservice(ev: any) {
    this.services = this.allServices;
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.services = this.services.filter((ser) => {
        return (ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  discountChange(event: any, service: any) {
    debugger
    // if (event && event.target.value) {
    //   let getDiscount = event.target.value;
    //   if (getDiscount > 0) {
    //     let discountValue = (service.totalprice * getDiscount) / 100;
    //     service.totalprice = service.totalprice - discountValue;
    //     // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    //     // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    //     // this.cash_paid_amount = this.grandTotal;
    //     // this.card_paid_amount = 0;
    //     // this.upi_paid_amount = 0;
    //   }
    // } else {
    //   service.totalprice = service.choosequantity * service.price;
    //   // this.discount = this.byValue;
    //   // // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    //   // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
    //   // this.cash_paid_amount = this.grandTotal;
    //   // this.card_paid_amount = 0;
    //   // this.upi_paid_amount = 0;


    // }

    if (event && event.target.value) {
      let getDiscount = event.target.value ? JSON.parse(event.target.value) : 0;
      if (getDiscount > 0) {

        let discountValue = (service.price * getDiscount) / 100;
        // let discountValue = (getDiscount / 100) / service.price;

        service.totalprice = Math.round(service.price - discountValue);
        service.discountAmount = discountValue;
        // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.cash_paid_amount = this.grandTotal;
        // this.card_paid_amount = 0;
        // this.upi_paid_amount = 0;
      }
    } else {
      service.totalprice = service.choosequantity * service.price;
      service.discountAmount = 0;

      // this.discount = this.byValue;
      // // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      // this.cash_paid_amount = this.grandTotal;
      // this.card_paid_amount = 0;
      // this.upi_paid_amount = 0;


    }
  }



  previous() {
    debugger
    this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);
  }
  productSave() {
    // if (this.productForm.value.product) {
    //   if (this.quantity > 0) {
    //     let productData = {
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
    //       data = getData;
    //     } else {
    //       data = [];
    //     }
    //     data.push(productData);
    //     localStorage.setItem('listOfProducts', JSON.stringify(data));
    //     localStorage.setItem('selectedProducts', JSON.stringify(productData));
    //     console.log('listOfProducts', data);
    //     this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);
    //   } else {
    //     this.toast.showToast("please select the product.")
    //   }
    // } else {
    //   this.toast.showToast("please select the product.")
    // }


    // if (this.merchantStoreId == '61') {
    //   this.productForm.controls['gender'].clearValidators();
    //   this.productForm.controls['gender'].updateValueAndValidity();
    // }
    // if (this.productForm.valid) {
    //   if (this.productlist.length > 0) {
    //     let productData = {
    //       customerName: this.productForm.value.userName,
    //       mobilenumber: this.productForm.value.mobilenumber,
    //       gender: this.productForm.value.gender,
    //       staff: this.productForm.value.staff.firstName,
    //       staff_Id: this.productForm.value.staff.accountId
    //     }
    //     localStorage.setItem('individualProducts', JSON.stringify(productData));
    //     this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    //     // this.router.navigate(['billing', { id: 0, type: 2 }]);
    //   } else {
    //     this.toast.showToast("please select the product.")
    //   }
    // } else {
    //   this.productForm.markAllAsTouched();
    // }
  }

  onChangeGender(event: any) {
  }
  onChangeStaff(event: any) {
    let staff = event.detail.value;
    // console.log('event', event.detail.value);
    // this.productList.forEach(element => {
    //   element.staff = staff.firstName;
    //   element.staff_Id = staff.accountId
    // });

  }
}
