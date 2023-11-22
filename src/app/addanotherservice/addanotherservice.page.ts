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
  constructor(
    private location: Location,
    public route: ActivatedRoute,
    private httpService: AddAnotherServiceService,
    public modalController: ModalController,
    private formBuilder: FormBuilder,
    private toast: ToastService,
    private loadingCtrl: LoadingController,
    public nav: NavigationHandler,
    private sharedService: SharedService
  ) { }

  paramSubscription: Subscription;
  serviceDetails: ServiceDetails;
  serviceForm: FormGroup;
  stylistList: Stylist[];
  formSubmitted: boolean;
  disableSaveBtn: boolean;

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
          if (type == 1) {
            this.isService = true;
            this.getStylistList();

          } else {
            this.isService = false;
            this.productList = [{
              'key': 1,
              'value': 'fashwash cream'
            },
            {
              'key': 2,
              'value': 'hair gel'
            }]

          }
          console.log('type', type);

        }
      });
    this.serviceForm = this.formBuilder.group({
      service: [null, Validators.compose([Validators.required])],
      stylist: [null]
    });
    this.productForm = this.formBuilder.group({
      product: [null, Validators.compose([Validators.required])],
      qty: [null]
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
        this.quantity = 0;
        const product = response.data.selectedProduct;
        this.selectedProduct = product;
        // this.serviceDetails.merchant_store_service_id = product.merchantProductId;
        this.productForm.get('product').setValue(product.productName);
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

  incrementQty() {
    debugger
    if (this.selectedProduct && this.selectedProduct.quantity) {
      if (this.quantity < this.selectedProduct.quantity) {
        this.quantity += 1;
        // let price = 100;
        this.price = this.quantity * this.selectedProduct.discountPrice;
      } else {
        this.toast.showToast("Increment Quantity Exceed.")
      }
    }


  }
  decrementQty() {
    if (this.quantity > 0) {
      this.quantity -= 1;
      let price = 100;

      this.price = this.quantity * price;

    }

  }

  previous() {
    if (this.quantity > 0) {
      let productData = {
        productName: this.productForm.value.product,
        qty: this.quantity,
        price: this.price
      }
      localStorage.setItem('selectedProducts', JSON.stringify(productData));
    }


    this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);
  }
  productSave() {
    if (this.quantity > 0) {
      let productData = {
        productName: this.productForm.value.product,
        qty: this.quantity,
        price: this.price
      }
      // localStorage.setItem('selectedProducts', JSON.stringify(productData));
      // this.previous();
    }
  }
}
