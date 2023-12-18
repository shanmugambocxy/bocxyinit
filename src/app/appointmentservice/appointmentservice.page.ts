import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { AppointmentServiceService } from './appointmentservice.service';
import { ToastService } from '../_services/toast.service';
import { MerchantService } from '../tab3/merchantService.model';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';
import { Stylist } from '../tab1/tab1.model';

@Component({
  selector: 'app-appointmentservice',
  templateUrl: './appointmentservice.page.html',
  styleUrls: ['./appointmentservice.page.scss'],
})
export class AppointmentServicePage implements OnInit {

  isServcieAvailable = false;
  allServices: MerchantService[];
  services: MerchantService[];
  stylistList: Stylist[];




  constructor(public modalCtrl: ModalController,
    private httpService: AppointmentServiceService,
    private addAnotherService: AddAnotherServiceService,
    private toast: ToastService,
    private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    await this.getMerchantService();
    // await this.getStylistList();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  filterservice(ev: any) {
    this.services = this.allServices;
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.services = this.services.filter((ser) => {
        return (ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }
  getStylistList() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.addAnotherService.getProfessionalList().subscribe((response) => {
      loading.then((l) => l.dismiss());
      if (response && response.status === 'SUCCESS') {
        this.stylistList = response.data;
      }
      else {
        this.toast.showToast('Something went wrong. Please try again');
      }
    });
  }
  getMerchantService() {
    const loading = this.loadingCtrl.create();
    loading.then(l => l.present());
    return new Promise((res, rej) => {
      this.httpService.getMerchantServices().subscribe(response => {
        loading.then(l => l.dismiss());
        if (response && response.status === 'SUCCESS') {
          this.services = this.allServices = response.data;
        } else {
          this.toast.showToast("Something went wrong. Please try again");
        }
        res(true);
      }, async err => {
        rej(err);
      });
    });
  }

  async serviceSelected(service: MerchantService) {
    await this.modalCtrl.dismiss({
      merchantStoreServiceId: service.merchantStoreServiceId,
      name: service.name
    });
  }
}
