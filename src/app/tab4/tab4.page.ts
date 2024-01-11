import { Component, OnInit, ViewChild } from '@angular/core';

import { NavController, LoadingController, ModalController, IonInfiniteScroll, AlertController, IonSlides } from '@ionic/angular';
import { MerchantCustomerServices } from './tab4.service';
import { MerchantCustomerService } from './tab4.model';
import { Router } from '@angular/router';
import { ToastService } from '../_services/toast.service';
import { PermissionService } from '../_services/permission.service';
import { IonContent } from '@ionic/angular';
@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  @ViewChild('slides', { static: false }) slider: IonSlides;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonContent) content: IonContent;
  public onlineOffline = navigator.onLine;
  Regular: MerchantCustomerService[] = [];
  // Visited: MerchantCustomerService[] = [];
  Visited: any = [];

  allVisitedCustomers: any = [];
  customers = 0;
  // selectedSlide: any;
  errorMessage: string;
  pageVisited: number;
  perPageVisited = 0;
  totalDataVisited = 0;
  totalPageVisited = 0;
  pageRegular: number;
  perPageRegular = 0;
  totalDataRegular = 0;
  totalPageRegular = 0;

  sliderOptions = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 1
  };
  merchantStoreId: any;
  count = 10;



  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private toast: ToastService,
    private merchantcustomerservices: MerchantCustomerServices,
    private alertController: AlertController,
    public router: Router,
    private permissionService: PermissionService,
  ) {
    document.addEventListener('online', () => { this.onlineOffline = true; });
    document.addEventListener('offline', () => { this.onlineOffline = false; });
    (async () => {
      if (this.onlineOffline) {

        this.permissionService.checkPermissionAccess('CUSTOMER_MANAGEMENT').then(
          data => {
            if (!data) {
              this.navCtrl.navigateRoot('/login');
            }
          }
        );
        let merchantStoreId = localStorage.getItem('merchant_store_id');
        this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
        await this.getAllVisitedCustomer();
        // await this.getVisitedCustomers();
        // await this.getRegularCustomers();
      } else {
        this.toast.showToast('No Internet Connection');
      }
    })();

  }

  ngOnInit() {

  }

  scrollToTop() {
    this.content.scrollToTop();
  }

  async segmentChanged(ev) {
    this.scrollToTop();
    // await this.selectedSlide.slideTo(this.customers);
    console.log(this.customers);

  }

  // async slidesChanged(slides: IonSlides) {
  //   this.selectedSlide = slides;
  //   slides.getActiveIndex().then(selectedIndex => {
  //     this.customers = selectedIndex;

  //   }
  //   );
  // }

  getVisitedCustomers() {
    return new Promise((resolve, reject) => {
      this.pageVisited = 1;
      this.errorMessage = undefined;
      this.merchantcustomerservices.getVisitedCustomers({ page: this.pageVisited }).subscribe(data => {
        if (data && data.status === 'SUCCESS') {
          this.Visited = data.data;
          this.perPageVisited = data.perPage;
          this.totalDataVisited = data.totalCount;
          this.totalPageVisited = data.totalPages;

        } else {
          this.errorMessage = 'Failed to load data';
          this.Visited = undefined;
        }
        resolve(1);
      }, error => {
        console.log(error);
        this.errorMessage = (error as any);
        this.Visited = undefined;
        reject(error);
      });
    });
  }

  getAllVisitedCustomer() {
    debugger
    return new Promise((resolve, reject) => {
      // this.pageVisited = 1;
      // this.errorMessage = undefined;
      // this.merchantcustomerservices.getVisitedCustomers({ page: 1 }).subscribe(data => {
      let merchantId = this.merchantStoreId ? JSON.parse(this.merchantStoreId) : 0;
      this.merchantcustomerservices.getCustomers(merchantId).subscribe((data: any) => {

        if (data) {
          this.Visited = [];
          this.allVisitedCustomers = this.Visited;

          if (data.length > 0) {
            data.forEach(element => {
              element.searchMobileNo = '';
              if (element.phoneno && element.phoneno != '') {
                let numericPart = (element.phoneno.replace(/\D/g, '')).slice(2);
                element.searchMobileNo = numericPart ? numericPart : "";
                element.dialcode = element.phoneno.slice(0, 3);
                console.log('element.searchMobileNo', element.searchMobileNo);

                // element.mobileNo = typeof element.searchMobileNo == 'string' ? JSON.parse(element.searchMobileNo) : ''
                // element.searchMobileNo = element.phoneno;
              }
            });
            // let getData = [];
            // data = data.filter(x => x.name != "");
            // for (let i = 0; i < this.count; i++) {
            //   getData.push(data[i])
            // }
            // this.Visited = getData;
            this.Visited = data.filter(x => x.name != "");
            this.allVisitedCustomers = this.Visited;
            console.log('allVisitedCustomers', this.allVisitedCustomers);

            // this.allVisitedCustomers = this.Visited;
          }


        } else {
          // this.errorMessage = 'Failed to load data';
          this.Visited = [];
          this.allVisitedCustomers = this.Visited;


        }
        resolve(1);
      }, error => {
        // this.errorMessage = (error as any);
        this.Visited = [];
        this.allVisitedCustomers = this.Visited;


        reject(error);
      });
    });
  }
  getRegularCustomers() {
    return new Promise((resolve, reject) => {
      this.pageRegular = 1;
      this.errorMessage = undefined;
      this.merchantcustomerservices.getRegularCustomers({ page: this.pageRegular }).subscribe(data => {

        if (data && data.status === 'SUCCESS') {
          this.Regular = data.data;
          this.perPageRegular = data.perPage;
          this.totalDataRegular = data.totalCount;
          this.totalPageRegular = data.totalPages;

        } else {
          this.errorMessage = 'Failed to load data';
          this.Regular = undefined;
        }
        resolve(1);
      }, error => {
        console.log(error);
        this.errorMessage = (error as any);
        this.Regular = undefined;
        reject(error);
      });
    });
  }

  loadMoreData(infiniteScroll) {
    debugger
    this.count = this.count + 5;

    this.pageVisited = this.pageVisited + 1;
    console.log(this.pageVisited);
    if (this.count > this.Visited.length) {
      this.count = this.Visited.length
    }
    // this.merchantcustomerservices.getVisitedCustomers({ page: this.pageVisited })
    //   .subscribe(
    //     data => {
    //       console.log('Async operation has ended');
    //       infiniteScroll.target.complete();
    //       if (data && data.status === 'SUCCESS') {
    //         this.perPageVisited = data.perPage;
    //         this.totalDataVisited = data.totalCount;
    //         this.totalPageVisited = data.totalPages;
    //         this.Visited.push(...data.data);
    //         this.errorMessage = undefined;
    //         if (this.Visited.length >= this.totalDataVisited) {
    //           infiniteScroll.target.disabled = true;
    //         }
    //       } else {
    //         this.errorMessage = 'Failed to load data';
    //       }
    //     },
    //     error => {
    //       console.log('Async operation has ended');
    //       infiniteScroll.target.complete();
    //       this.errorMessage = (error as any);
    //     }
    //   );
    // this.allVisitedCustomers = this.Visited.filter((item: any, index: any) => { index < 5 });
    let data = [];

    for (let i = 0; i < this.count; i++) {
      data.push(this.Visited[i])
    }
    this.allVisitedCustomers = data;
    infiniteScroll.target.complete();

    // if (this.Visited.length == this.allVisitedCustomers.length) {
    //   infiniteScroll.target.complete();

    // }
    console.log('allVisitedCustomers', this.allVisitedCustomers);

  }

  loadMoreDataRegular(infiniteScroll) {
    debugger
    this.pageRegular = this.pageRegular + 1;
    console.log(this.pageRegular + 'regular');
    this.merchantcustomerservices.getRegularCustomers({ page: this.pageRegular })
      .subscribe(
        data => {
          console.log('Async operation has ended');
          infiniteScroll.target.complete();
          if (data && data.status === 'SUCCESS') {
            this.perPageRegular = data.perPage;
            this.totalDataRegular = data.totalCount;
            this.totalPageRegular = data.totalPages;
            this.Visited.push(...data.data);
            this.errorMessage = undefined;
            if (this.Visited.length >= this.totalDataRegular) {
              infiniteScroll.target.disabled = true;
            }
          } else {
            this.errorMessage = 'Failed to load data';
          }
        },
        error => {
          console.log('Async operation has ended');
          infiniteScroll.target.complete();
          this.errorMessage = (error as any);
        }
      );
  }

  doRefresh(refresher) {
    this.count = 10;
    this.Visited = [];
    this.allVisitedCustomers = this.Visited;
    this.getAllVisitedCustomer().then(data => {
      refresher.target.complete();

    }).catch(err => {
      refresher.target.complete();
    });

    // this.getVisitedCustomers().then(data => {
    //   this.getRegularCustomers().then(data1 => {
    //     refresher.target.complete();
    //   }).catch(err => {
    //     refresher.target.complete();
    //   });
    // }).catch(err => {
    //   refresher.target.complete();
    // });

  }

  filterCustomerService(event: any) {
    debugger
    const val = event == '' ? '' : event.target.value;

    if (val && val.trim() !== '') {
      this.allVisitedCustomers = this.Visited.filter((ser) => {
        return (ser.searchMobileNo.toLowerCase().indexOf(val.toLowerCase()) > -1 || ser.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        // return (ser.phoneno.toLowerCase().indexOf(val.toLowerCase()) > -1);


        // return (ser.firstName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.allVisitedCustomers = this.Visited;
    }

  }
}
