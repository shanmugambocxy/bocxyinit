import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';
import { ToastService } from '../_services/toast.service';
import { MerchantProduct } from '../tab3/merchantService.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-appointmentproducts',
  templateUrl: './appointmentproducts.page.html',
  styleUrls: ['./appointmentproducts.page.scss'],
})
export class AppointmentproductsPage implements OnInit {
  isServcieAvailable = false;
  // allProducts: MerchantProduct[];
  // products: MerchantProduct[];
  allProducts: any[];
  products: any[];
  productForm: FormGroup;
  items!: FormArray;

  constructor(public modalCtrl: ModalController,
    private httpService: AppointmentServiceService,
    private toast: ToastService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,) { }

  async ngOnInit() {
    await this.getMerchantProduct();
    // this.productForm = this.formBuilder.group({
    //   product: [null, Validators.compose([Validators.required])],
    //   qty: [null],
    //   gender: [],
    //   staff: []
    // });
    // this.productForm = this.formBuilder.group({
    //   items: new FormArray([])

    // });

  }

  incrementQty(product: any) {
    debugger
    // if (this.selectedProduct && this.selectedProduct.quantity) {
    if (product.choosequantity) {
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


  dismiss() {
    this.modalCtrl.dismiss();
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
      this.httpService.getInventoryProducts(data).subscribe(response => {
        console.log('responsse Product', response);

        loading.then(l => l.dismiss());
        if (response && response.data.length > 0) {
          this.products = [];
          this.products = response.data;
          this.products.forEach(element => {
            element.choosequantity = 1;
            element.totalprice = element.choosequantity * element.discountPrice;
            element.checked = false;
            element.choosediscount = 0;
            element.discountAmount = 0;
          })
          this.allProducts = this.products;
          console.log('products1', this.products);

        } else if (response && response.data) {
          // this.products = [response.data];

          // this.allProducts = this.products;
          this.products = [];
          this.allProducts = this.products;
          console.log('products2', this.products);
        } else {
          // this.toast.showToast("Something went wrong. Please try again");
        }
        res(true);
      }, async err => {
        rej(err);
      });
    });
  }

  discountChange(event: any, product: any) {
    if (event && event.target.value) {
      let getDiscount = event.target.value;
      if (getDiscount > 0) {
        let discountValue = (product.totalprice * getDiscount) / 100;
        product.totalprice = Math.round(product.totalprice - discountValue);
        product.discountAmount = discountValue;
        // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
        // this.cash_paid_amount = this.grandTotal;
        // this.card_paid_amount = 0;
        // this.upi_paid_amount = 0;
      }
    } else {
      product.totalprice = product.choosequantity * product.discountPrice;
      product.discountAmount = 0;

      // this.discount = this.byValue;
      // // this.grandTotal = Math.round(this.subTotal + (this.subTotal * this.CGST) + (this.subTotal * this.SGST) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      // this.grandTotal = Math.round(this.subTotal + (this.CGSTAmount) + (this.SGSTAmount) + (this.addTip ? this.addTip : 0) - (this.discount ? this.discount : 0));
      // this.cash_paid_amount = this.grandTotal;
      // this.card_paid_amount = 0;
      // this.upi_paid_amount = 0;


    }
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
      // let listOfProducts = data.concate(selectedProducts);
      let listOfProducts = selectedProducts;

      localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
      // this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);
      this.dismiss();

    } else {
      let listOfProducts = selectedProducts;
      localStorage.setItem('listOfProducts', JSON.stringify(listOfProducts));
      this.dismiss();

      // this.nav.GoBackTo('/detailappointment/' + this.serviceDetails.appointment_id);

    }


  }
  selectProduct(product: any) {
    product.checked = !product.checked;
  }

  async productSelected(product: any) {
    await this.modalCtrl.dismiss({
      selectedProduct: product
    });
  }

}
