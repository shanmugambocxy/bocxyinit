import { Component, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';
import { ToastService } from '../_services/toast.service';
import { MerchantProduct } from '../tab3/merchantService.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';
import { Stylist } from '../stylistmgmt/stylistmgmt.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

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
  searchText: any;
  stylistList: Stylist[];
  paramSubscription: Subscription;
  stylistAccountId: number;
  @Input() id: any;
  @Input() type: any;
  @Input() accountId: any;
  @Input() billid: any;


  constructor(public modalCtrl: ModalController,
    private httpService: AppointmentServiceService,
    private toast: ToastService,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private addAnotherService: AddAnotherServiceService,
    public route: ActivatedRoute,) { }

  async ngOnInit() {
    this.paramSubscription = this.route.params.subscribe(
      async (params: Params) => {
        console.log('params', params);

        // if (params['appointmentId']) {
        //   this.serviceDetails = new ServiceDetails();
        //   this.serviceDetails.appointment_id = Number(params['appointmentId']);

        // }

        // if (params['type']) {
        //   let type = Number(params['type']);
        //   let page = Number(params['page']);
        //   let accountId = Number(params['accountId']);
        //   // this.type = type;
        //   // this.page = page;
        //   if (accountId) {
        //     this.stylistAccountId = accountId;
        //   }
        // }
        if (this.accountId) {
          this.stylistAccountId = this.accountId;
        }
        debugger
        await this.getStylistList();

        await this.getMerchantProduct();
        // await this.getStylistList();
      });



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
    if (product.checked) {
      if (product.choosequantity < product.quantity) {
        product.choosequantity += 1;
        // let price = 100;
        let totalPrice = product.choosequantity * product.actualPrice;
        let discountValue = (totalPrice * product.choosediscount) / 100;

        // let discountValue = (getDiscount / 100) / service.price;
        // let totalPrice = service.totalprice;
        product.totalprice = Math.round(totalPrice - discountValue);



        // product.totalprice = product.choosequantity * product.discountPrice;
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

      let totalPrice = product.choosequantity * product.actualPrice;
      let discountValue = (totalPrice * product.choosediscount) / 100;

      // let discountValue = (getDiscount / 100) / service.price;
      // let totalPrice = service.totalprice;
      product.totalprice = Math.round(totalPrice - discountValue);

      // product.totalprice = product.choosequantity * product.actualPrice;
    }

  }


  dismiss() {
    this.modalCtrl.dismiss();
  }

  filterservice(ev: any) {
    debugger
    this.products = this.allProducts;
    // const val = ev.target.value;
    const val = ev;
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
      this.httpService.getInventoryProducts(data).subscribe(async response => {
        console.log('responsse Product', response);

        loading.then(l => l.dismiss());

        if (response && response.data.length > 0) {
          this.products = [];
          this.products = response.data;
          this.products.forEach(element => {
            element.choosequantity = 0;
            // element.totalprice = element.choosequantity * element.discountPrice;
            element.totalprice = element.actualPrice;
            // element.professionist_account_id = this.stylistAccountId;
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

    const theEvent = event || window.event;
    if (event && event.target.value) {
      let getDiscount = event.target.value ? JSON.parse(event.target.value) : 0;
      if (getDiscount) {
        if (getDiscount <= 100) {
          let totalprice = product.choosequantity * product.actualPrice;
          let discountValue = (totalprice * getDiscount) / 100;
          // let discountValue = (getDiscount / 100) / service.price;
          product.totalprice = Math.round(totalprice - discountValue);
          product.discountAmount = discountValue;
        } else {
          event.target.value = '100';
          getDiscount = event.target.value ? JSON.parse(event.target.value) : 0;
          let totalprice = product.choosequantity * product.actualPrice;
          let discountValue = (totalprice * getDiscount) / 100;
          // let discountValue = (getDiscount / 100) / service.price;
          product.totalprice = Math.round(totalprice - discountValue);
          product.discountAmount = discountValue;
        }

      } else {
        product.totalprice = product.choosequantity * product.actualPrice;
        product.discountAmount = 0;
      }
    } else {
      product.totalprice = product.choosequantity * product.actualPrice;
      product.discountAmount = 0;
    }








    // if (event && event.target.value) {
    //   let getDiscount = event.target.value;
    //   if (getDiscount > 0) {
    //     if (getDiscount > 100) {
    //       theEvent.returnValue = false;
    //       if (theEvent.preventDefault) {
    //         theEvent.preventDefault();
    //       }
    //       event.target.value = "100";
    //       getDiscount = 0;
    //       getDiscount = event.target.value ? JSON.parse(event.target.value) : 0;
    //       // let discountValue = (product.actualPrice * getDiscount) / 100;
    //       let discountValue = (product.totalprice * getDiscount) / 100;
    //       product.totalprice = Math.round(product.totalprice - discountValue);

    //       product.discountAmount = discountValue;
    //     } else {
    //       let discountValue = (product.totalprice * getDiscount) / 100;
    //       product.totalprice = Math.round(product.totalprice - discountValue);

    //       product.discountAmount = discountValue;
    //     }

    //   }
    // } else {
    //   product.totalprice = product.choosequantity * product.discountPrice;
    //   product.discountAmount = 0;
    // }
  }

  selectOption(event: any, service: any): void {
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

  getStylistList() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.addAnotherService.getProfessionalList().subscribe((response: any) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.stylistList = response.data;
        // this.staffList = response.data;
      }
      else {
        this.toast.showToast('Something went wrong. Please try again');
      }
    });
  }

  addTempororyProduct() {
    debugger
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);

    this.searchText = '';
    this.filterservice('')
    let selectedProducts = [];
    let multiProducts = [];
    selectedProducts = this.products.filter(x => x.checked);
    for (let i = 0; i < selectedProducts.length; i++) {
      let products = {};
      let getstaffName = this.stylistList.filter(x => x.accountId == selectedProducts[i].professionist_account_id);
      let staffName: any;
      if (getstaffName.length > 0) {
        staffName = getstaffName[0].firstName;
      }
      let newDate = new Date();
      let currentdate = newDate.getFullYear() + "-" + (newDate.getMonth() + 1).toString().padStart(2, '0') + "-" + newDate.getDate().toString().padStart(2, '0') + ' ' + newDate.getHours().toString().padStart(2, '0') + ":" + newDate.getMinutes().toString().padStart(2, '0');
      products = {
        "appointment_id": this.id,
        "bill_Id": this.billid,
        "merchantStoreId": merchantStoreId,
        "product_name": selectedProducts[i].productName,
        "quantity": selectedProducts[i].choosequantity,
        "price": selectedProducts[i].actualPrice,
        "staff": staffName,
        "staff_Id": selectedProducts[i].professionist_account_id,
        "discount": selectedProducts[i].choosediscount && selectedProducts[i].choosediscount != '' ? JSON.parse(selectedProducts[i].choosediscount) : 0,
        "discountamount": selectedProducts[i].discountAmount,
        "totalprice": selectedProducts[i].totalprice,
        "created_at": currentdate
      }
      multiProducts.push(products);
    }
    let addProducts = [];
    addProducts = multiProducts;
    console.log('addProducts', addProducts);

    this.httpService.addProduct(addProducts).subscribe((res: any) => {
      if (res.status == "SUCCESS") {
        this.toast.showToast(res.message);
        this.dismiss();
      } else {
        this.toast.showToast(res.message);

      }
    })
  }
  productMultiSave() {
    debugger
    // product.checked
    if (this.type == 1) {

      this.searchText = '';
      this.filterservice('')
      let selectedProducts = [];
      selectedProducts = this.products.filter(x => x.checked);
      // selectedProducts.forEach(element => {
      //   let discountValue = ((element.choosequantity * element.price) * element.choosediscount) / 100;
      //   element.discount = element.choosediscount ? element.choosediscount : 0;
      //   element.discountAmount = (element.choosequantity * element.price) - discountValue
      // });
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
    } else {
      this.addTempororyProduct();
    }


  }
  selectProduct(product: any) {
    product.checked = !product.checked;
    if (product.checked) {
      product.choosequantity = 1;
      product.totalprice = product.choosequantity * product.discountPrice;
      product.professionist_account_id = this.stylistAccountId;

    } else {
      product.choosequantity = 0;
      // product.totalprice = product.choosequantity * product.discountPrice;
      product.totalprice = product.actualPrice;
      product.choosediscount = 0;
      product.professionist_account_id = 0;

    }
  }

  async productSelected(product: any) {
    await this.modalCtrl.dismiss({
      selectedProduct: product
    });
  }

}
