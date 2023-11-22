import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AppointmentServiceService } from '../appointmentservice/appointmentservice.service';
import { ToastService } from '../_services/toast.service';
import { MerchantProduct } from '../tab3/merchantService.model';

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
  constructor(public modalCtrl: ModalController,
    private httpService: AppointmentServiceService,
    private toast: ToastService,
    private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    await this.getMerchantProduct();

  }


  dismiss() {
    this.modalCtrl.dismiss();
  }

  filterservice(ev: any) {
    this.products = this.allProducts;
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.products = this.products.filter((ser) => {
        return (ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
        if (response && response.data.length > 1) {
          this.products = response.data;

          this.allProducts = this.products;
          console.log('products1', this.products);

        } else if (response && response.data) {
          this.products = [response.data];

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

  async productSelected(product: any) {
    await this.modalCtrl.dismiss({
      selectedProduct: product
    });
  }

}
