import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { AddAnotherServiceService } from './addanotherservice.service';
import { AppointmentServicePage } from '../appointmentservice/appointmentservice.page';
import { LoadingController, ModalController, AlertController } from '@ionic/angular';
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
    private appointmentServiceService: AppointmentServiceService
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
          this.type = type;
          this.page = page;
          if (this.type == 1) {
            this.isService = true;
            this.getStylistList();
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
      service: [null, Validators.compose([Validators.required])],
      stylist: [null]
    });
    this.productForm = this.formBuilder.group({
      product: [null, Validators.compose([Validators.required])],
      qty: [null],
      gender: [],
      staff: []
    });

  }
  ionViewWillEnter() {
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
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
    this.formSubmitted = true;
    this.disableSaveBtn = true;
    if (this.serviceForm.valid) {
      this.serviceDetails.professionist_account_id = this.serviceForm.value.stylist;
      const loading = this.loadingCtrl.create();
      loading.then((l) => l.present());
      this.httpService.addService(this.serviceDetails).subscribe((response) => {
        loading.then((l) => l.dismiss());
        if (response && response.status === 'SUCCESS') {
          this.previous();
        }
        else {
          this.toast.showToast('Something went wrong. Please try again');
          this.disableSaveBtn = false;
        }
      });
    }
    else {
      this.disableSaveBtn = false;
    }

  }


  async showMerchantProductModal() {
    const modal = await this.modalController.create({
      component: AppointmentproductsPage,
      cssClass: 'my-custom-class',
    });
    modal.onWillDismiss().then(response => {
      if (response.data) {
        console.log('productpopup', response.data);
        const product = response.data.selectedProduct;
        this.selectedProduct = product;
        // this.serviceDetails.merchant_store_service_id = product.merchantProductId;
        this.productForm.get('product').setValue(product.productName);
        if (this.productForm.value.product) {
          this.quantity = 1;
          this.price = this.quantity * product.discountPrice;

        } else {
          this.quantity = 0;
        }

      }
    });
    return await modal.present();
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
    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    return new Promise((res, rej) => {
      // let data = {
      //   "type": "inventory",
      //   "storeId": "651d0aec391e55ce6109ce5b"
      // }

      let data = {
        "type": "Instore",
        "storeId": "652ac589fb1d72ce6584dc31"
      }
      this.appointmentServiceService.getInventoryProducts(data).subscribe(response => {
        console.log('responsse Product', response);
        loading.then(l => l.dismiss());
        if (response && response.data.length > 0) {
          this.products = response.data;
          this.products.forEach(element => {
            element.choosequantity = 1;
            element.totalprice = element.choosequantity * element.discountPrice;
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
    if (product.choosequantity < product.quantity) {
      product.choosequantity += 1;
      // let price = 100;
      product.totalprice = product.choosequantity * product.discountPrice;
    } else {
      this.toast.showToast("Increment Quantity Exceed.");
    }
    // }


  }
  decrementQty(product: any) {
    debugger
    if (product.choosequantity > 1) {
      product.choosequantity -= 1;
      // let price = 100;

      product.totalprice = product.choosequantity * product.discountPrice;
    }

  }
  selectProduct(product: any) {
    product.checked = !product.checked;
  }
  productMultiSave() {
    // product.checked
    debugger
    let selectedProducts = [];
    selectedProducts = this.products.filter(x => x.checked);
    let data: any = [];
    let getData = JSON.parse(localStorage.getItem('listOfProducts'))
    if (getData) {
      data = getData;
    } else {
      data = [];
    }
    if (data && data.length > 0) {
      let listOfProducts = data.concate(selectedProducts);
      localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
      this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    } else {
      let listOfProducts = selectedProducts;
      localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
      this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    }


  }

  filterservice(ev: any) {
    this.products = this.allProducts;
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      // this.products = this.products.filter((ser) => {
      //   return (ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      // });
      this.products = this.products.filter((ser) => {
        return (ser.productName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });

    }
  }

  discountChange(event: any, product: any) {
    if (event && event.target.value) {
      let getDiscount = event.target.value;
      if (getDiscount > 0) {
        let discountValue = (product.totalprice * getDiscount) / 100;
        product.totalprice = product.totalprice - discountValue;
        // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.cash_paid_amount = this.grandTotal;
        // this.card_paid_amount = 0;
        // this.upi_paid_amount = 0;
      }
    } else {
      product.totalprice = product.choosequantity * product.discountPrice;
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
    if (this.productForm.value.product) {
      if (this.quantity > 0) {
        let productData = {
          product_name: this.productForm.value.product,
          quantity: this.quantity,
          price: this.price,
          gender: this.productForm.value.gender,
          staff: this.productForm.value.staff
        }
        // let listOfProducts: any = [];
        // listOfProducts.push(productData);
        // console.log('listOfProducts', listOfProducts);
        let data: any = [];
        let getData = JSON.parse(localStorage.getItem('listOfProducts'))
        if (getData) {
          data = getData;
        } else {
          data = [];
        }
        data.push(productData);
        localStorage.setItem('listOfProducts', JSON.stringify(data));
        localStorage.setItem('selectedProducts', JSON.stringify(productData));
        console.log('listOfProducts', data);
        this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);
      } else {
        this.toast.showToast("please select the product.")
      }
    } else {
      this.toast.showToast("please select the product.")
    }
  }

  onChangeGender(event: any) {
  }
  onChangeStaff(event: any) {

  }
}
