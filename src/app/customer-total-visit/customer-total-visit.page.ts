import { Component, OnInit } from '@angular/core';
import { MerchantCustomerServices } from '../tab4/tab4.service';
import { NavigationHandler } from '../_services/navigation-handler.service';

@Component({
  selector: 'app-customer-total-visit',
  templateUrl: './customer-total-visit.page.html',
  styleUrls: ['./customer-total-visit.page.scss'],
})
export class CustomerTotalVisitPage implements OnInit {
  Visited: any = [];

  allVisitedCustomers: any = [];
  count = 10;
  customerlabel: any = ['S.no', 'Booking Id', 'Visited Date', 'Stylist Name', 'Total Bill Value', 'Action']
  currentPage = 1;
  itemsPerPage = 10;
  merchantStoreId: any;

  constructor(private merchantcustomerservices: MerchantCustomerServices, private nav: NavigationHandler,
  ) {
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
    this.getAllVisitedCustomer();
  }

  ngOnInit() {
  }
  getAllVisitedCustomer() {
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
  get displayedBills() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    console.log('test');

    return this.allVisitedCustomers.slice(startIndex, endIndex);
  }
  goToBilling() {

  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
    // this.itemCount = this.getAllBillings - this.itemCount;
    // console.log('itemscountp', (this.getAllBillings.length + this.itemsPerPage) + this.itemCount);

  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
    let count = this.allVisitedCustomers.length - this.displayedBills.length;
    // this.itemCount = count - this.itemCount;
    console.log('this.itemCount', count);


    // console.log('itemscountn', (this.getAllBillings.length - this.itemsPerPage) - this.itemCount);

  }
  totalPages() {
    return Math.ceil(this.allVisitedCustomers.length / this.itemsPerPage);
  }
  previous() {
    this.nav.GoBackTo('/home/tabs/tab4');
  }
}
