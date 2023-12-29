import { Component, OnInit } from '@angular/core';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable'
import * as _ from 'lodash';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { StylistManagementService } from '../stylistmgmt/stylistmgmt.service';
import { DateService } from '../_services/date.service';
import { ToastService } from '../_services/toast.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  selectedCategory: any;
  selectedDate: any;
  selectedGender: any;
  catagoryList: any = [{ id: 1, name: "Sales List" }, { id: 2, name: "Service Sales" }, { id: 3, name: "Product Sales" }, { id: 4, name: "Staff Sales" }];
  dateTypeList: any = [{ id: 1, name: "Today" }, { id: 2, name: "YesterDay" }, { id: 3, name: "7 days" }, { id: 4, name: "Current Month" }, { id: 5, name: "Custom Range" }];
  genterTypeList: any = [{ id: 1, name: "male" }, { id: 2, name: "female" }, { id: 3, name: "others" }, { id: 4, name: "All Customers" }];
  salesList: any = [];
  serviceSales: any = [];
  productSales: any = [];
  staffSalesByService: any = [];
  staffSalesByProduct: any = [];
  labelValueList: any = [{ name: "8877566" }, { name: "12/12/2023" }, { name: "Shan" }, { name: "Cash" }, { name: "5000" }]
  getBillings: any = [];
  getAllBillings: any = [];
  showCustomeDate: boolean = false;
  totalBillValue: any;
  cashPaymentAmount: any;
  onlinePaymentAmount: any;
  cardPaymentAmount: any;
  startDate: any;
  endDate: any;
  productsalesList: any = [];
  byServiceLabel: any = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service Amount" }, { name: "Discount Amount" }, { name: "Commission / Tip" }, { name: "Duration(Minutes)" }, { name: "Total Amount" }];
  byProductLabel: any = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Products Amount" }, { name: "Discount Amount" }, { name: "Commission" }, { name: "Total Amount" }];
  byServiceList: any = [];
  byProductList: any = [];
  merchantStoreId: any;
  staffSalesLabelList: any = [];
  selectSalesPerformance: any = 1;
  salesperformanceList: any = [{ id: 1, name: "Daily performance" }, { id: 2, name: "Monthly performance" },];
  stylistData: any = [];
  dailyReportList: any = [];
  monthlyReportList: any = [];
  cashPercentage: any;
  cardPercentage: any;
  upiPercentage: any;
  searchtext: any;


  data: any[] = []; // Your table data
  pageSize: number = 10; // Number of items per page
  currentPage: number = 1; // Current page

  constructor(private appointmentListService: AppointmentListService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private datePipe: DatePipe,
    private httpService: DetailAppointmentService,
    private stylistManagementService: StylistManagementService,
    public dateService: DateService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    // this.getAllBillings();
    this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Customer MobileNumber" }, { name: "Payment Mode" }, { name: "Net Total" }, { name: "Tax" }, { name: "Gross" }, { name: "Action" }];
    const dbDate = new Date('2023-11-21T20:14:13.000Z');
    const formattedDate = this.datePipe.transform(dbDate, 'yyyy-MM-dd');
    console.log('formattedDate', formattedDate);
    this.selectedCategory = 1;
    this.selectedDate = 1;
    this.selectedGender = 4;
    console.log('oninit');

  }
  ionViewWillEnter() {

    let merchantStoreId = localStorage.getItem('merchant_store_id');
    console.log('merchantStoreId', merchantStoreId);
    this.merchantStoreId = merchantStoreId ? merchantStoreId : '';
    console.log('willenter');


    // const originalDate: string = '2023-11-22T12:57:22.000Z';

    // // Parse the original date string into a Date object
    // const dateObject: Date = new Date(originalDate);

    // // Format the date using DatePipe
    // const formattedDate: string = this.datePipe.transform(dateObject, 'yyyy-MM-dd');

    // console.log('formattedDate', formattedDate);


    const originalDate: string = '2023-11-22T20:33:55.000Z';

    // Parse the original date string into a Date object
    const dateObject: Date = new Date(originalDate);

    // Set the date to UTC using setUTC methods
    dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());

    // Format the date using DatePipe
    const formattedDate: string = this.datePipe.transform(dateObject, 'yyyy-MM-dd');

    console.log('formattedDate', formattedDate);


    const originalDatenew: string = '2023-11-22T20:33:55.000Z';

    // Parse the original date string into a Date object
    const dateObjectnew: Date = new Date(originalDate);

    // Set the date to UTC using setUTC methods
    dateObject.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());

    // Format the date using DatePipe
    const formattedDatenew: string = this.datePipe.transform(dateObject, 'yyyy-MM-dd');

    console.log('formattedDate', formattedDate);
  }
  async ionViewDidEnter() {
    console.log('didenter');

    await this.getBillingByStoreId();

  }

  getAllBilling() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    this.appointmentListService.getBilling().subscribe((res) => {
      loading.then((l) => l.dismiss());
      if (res && res.data.length > 0) {
        this.getBillings = res.data;
        console.log('res', res);
      }
    })
  }

  getBillingByStoreId() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    console.log('date', moment(new Date('2023-11-21T20:14:13.000Z')).format('YYYY-MM-DD'));
    let iso = new Date('2023-11-21T20:14:13.000Z').toISOString;
    console.log('iso', iso);
    let storeId: number = 352;
    let id = localStorage.getItem('merchant_store_id');
    let merchantStoreId: number;
    if (id) {
      merchantStoreId = JSON.parse(id)
    }
    var startDate: any;
    var endDate: any;
    var data: any;
    var currentdate = new Date();
    if (this.selectedDate == 1) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 2) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 3) {
      // startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate() + ' ' + '00' + ":"
      //   + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + (currentdate.getDate() - 6) + ' ' + currentdate.getHours() + ":"
      //   + currentdate.getMinutes();

      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 6).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';

      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 4) {
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      let firstDay = new Date(y, m, 1);
      let lastDay = new Date(y, m + 1, 0);
      startDate = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1).toString().padStart(2, '0')
        + "-" + firstDay.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
        + currentdate.getMinutes().toString().padStart(2, '0');
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }

    }
    if (this.selectedDate == 5) {
      debugger
      let getStartDate = new Date(this.startDate);
      let getEndDate = new Date(this.endDate);
      startDate = getStartDate.getFullYear() + "-" + (getStartDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getStartDate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = getEndDate.getFullYear() + "-" + (getEndDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getEndDate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';

      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }

    this.appointmentListService.getByStore(data).subscribe(res => {
      if (res && res.data.length > 0) {
        debugger
        res.data.forEach(element => {
          if (element.paidAmount) {
            element.paidAmount = JSON.parse(element.paidAmount)
          }
          if (element.created_at) {
            console.log('created_at', element.created_at);
            // let date = moment(new Date(element.created_at)).format('YYYY-MM-DD');
            // console.log('formatedate', date);
            // element.created_at = date;



            // let date = (element.createdAt.split(" ")[0]
            //   .format('YYYY-MM-DD')) + " " +
            //   (this.dateService.timeConvert(element.createdAt.split(" ")[1]))
            // console.log('date', date);


            const originalDate: string = element.created_at;

            // Parse the original date string into a Date object
            const dateObject: Date = new Date(originalDate);

            // Format the date using DatePipe
            const formattedDate: string = this.datePipe.transform(dateObject, 'yyyy-MM-dd');
            element.created_at = formattedDate;
            console.log('element.created_at', element.created_at);

          }
          if (element.phoneno && element.phoneno != '') {
            let numericPart = (element.phoneno.replace(/\D/g, '')).slice(2);
            element.searchMobileNo = numericPart ? numericPart : "";
            // element.searchMobileNo = element.phoneno;
          }
          if (element.CGST) {
            element.CGST = JSON.parse(element.CGST);
          }
          if (element.SGST) {
            element.SGST = JSON.parse(element.SGST);
          }
          if (element.gender) {
            element.gender = (element.gender).toLowerCase();
          }
          if (element.cash_paid_amount) {
            element.cash_paid_amount = JSON.parse(element.cash_paid_amount)
          }
          if (element.card_paid_amount) {
            element.card_paid_amount = JSON.parse(element.card_paid_amount)
          }
          if (element.upi_paid_amount) {
            element.upi_paid_amount = JSON.parse(element.upi_paid_amount)
          }
          if (element.Grandtotal) {
            element.Grandtotal = JSON.parse(element.Grandtotal);
          }
          // element.testString = element.modeofpayment.split('')
          // if (element.modeofpayment && element.modeofpayment.indexOf(',')) {
          //   element.paymenttype = element.modeofpayment.split(',')

          // } else {
          //   element.paymenttype = [element.modeofpayment]
          // }
          // if(element.)
          // element.arraytestString = [element.modeofpayment]
          loading.then((l) => l.dismiss());


        });

        this.getBillings = [];
        this.getAllBillings = this.getBillings;
        let gender: any;
        gender = this.selectedGender == 1 ? 'male' : this.selectedGender == 2 ? 'female' : this.selectedGender == 3 ? 'others' : '';
        if (this.selectedGender == 4) {
          this.getBillings = res.data;
          this.getAllBillings = this.getBillings;
          this.totalAmount();

        } else {
          this.getBillings = res.data.filter(x => x.gender == this.selectedGender);
          this.getAllBillings = this.getBillings;
          this.totalAmount();

        }

        console.log('initialget', this.getAllBillings);
        // this.onChangeDate('event');
      } else {
        loading.then((l) => l.dismiss());

        this.getBillings = [];
        this.getAllBillings = this.getBillings;
        this.totalAmount();

      }
    }, (error) => {
      loading.then((l) => l.dismiss());
      this.getBillings = [];
      this.getAllBillings = this.getBillings;
      this.totalAmount();

    }), (error) => {
      loading.then((l) => l.dismiss());
      this.getBillings = [];
      this.getAllBillings = this.getBillings;
      this.totalAmount();

    }
  }
  totalAmount() {
    debugger

    // let cashPayment = this.getAllBillings.filter(x => x.modeofpayment == 'Cash');
    // this.cashPaymentAmount = _.sumBy(cashPayment, 'paidAmount');


    // let totalCashAmount = _.sumBy(this.getAllBillings, 'paidAmount')
    let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
    this.cashPaymentAmount = cashAmount ? Math.round(cashAmount) : 0;
    let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
    this.cardPaymentAmount = cardAmount ? Math.round(cardAmount) : 0;
    let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
    this.onlinePaymentAmount = upiAmount ? Math.round(upiAmount) : 0;

    this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
    this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
    this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
    debugger


    console.log('cashPercentage', this.cashPercentage);


    this.totalBillValue = Math.round(_.sumBy(this.getAllBillings, 'Grandtotal'));
    debugger
    // if (this.selectedCategory == 4) {
    //   this.totalBillValue = Math.round(_.sumBy(this.getAllBillings, 'total'));
    // }
    console.log('getAllBillings', this.getAllBillings);
  }
  onChangeCategory(event: any) {
    if (this.selectedDate != 5) {

      this.showCustomeDate = false;
    }
    this.startDate = '';
    this.endDate = '';
    if (this.selectedCategory == 1) {
      // this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
      this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Customer MobileNumber" }, { name: "Payment Mode" }, { name: "Net Total" }, { name: "Tax" }, { name: "Gross" }, { name: "Action" }];
      this.getSaleslist();
    }
    if (this.selectedCategory == 2) {
      // this.salesList = [{ name: "S.no" }, { name: "Service Name" }, { name: "Qty Sold" }, { name: "Consumed Products" }, { name: "Net Total" }, { name: "Tax Total" }, { name: "Gross Total" }];
      this.salesList = [{ name: "S.no" }, { name: "Service Name" }, { name: "Qty Sold" }, { name: "Gross Total" }];
      // { name: "Consumed Products" },
      this.getAllBillings = [];
      this.getServiceSalesList();
    }
    if (this.selectedCategory == 3) {
      // , { name: "Product Id" },{ name: "Purchased By" },, { name: "Action" }]
      this.salesList = [{ name: "S.no" }, { name: "Product Name" }, { name: "Quantity" }, { name: "Total Amount" }];
      this.getProductSalesList();
    }
    if (this.selectedCategory == 4) {
      // this.staffSalesByService = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service Amount" }, { name: "Discount Amount" }, { name: "Commission / Tip" }, { name: "Duration (Minutes)" }, { name: "Total Amount" }];
      // this.staffSalesByProduct = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Product Amount" }, { name: "Discount Amount" }, { name: "Commission" }, { name: "Total Amount" }];
      this.staffSalesLabelList = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service" }, { name: "Product" }, { name: "Total" }, { name: "No of Bills" }, { name: "ABV" }, { name: "Service Incentive" }, { name: "Product Incentive" }];
      // this.staffSalesByService = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service" },{ name: "Product" }, { name: "Total" }, { name: "no of clients" }, { name: "ABV" }];
      // this.staffSalesByProduct = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Product Amount" }, { name: "Discount Amount" }, { name: "Commission" }, { name: "Total Amount" }];
      // this.getStaffSales_byService_byProducts()
      this.getStylists();
    }
  }
  getSaleslist() {
    // this.getAllBillings = this.getBillings;
    this.getBillingByStoreId();

    // this.onChangeDate('event');
  }
  getServiceSalesList() {
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    var servicedata = {};
    this.getAllBillings = [];
    let id = localStorage.getItem('merchant_store_id');
    var merchantStoreId: number = 0;
    if (id) {
      merchantStoreId = JSON.parse(id)
    }
    // var todayDate = moment(new Date()).format('YYYY-MM-DD');
    // var nextDate = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    // var yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
    // var sevenDays = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');

    // // var todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ssZ');
    // // var nextDate = moment(new Date()).add(1, 'days').format('yyyy-MM-ddTHH:mm:ssZ');
    // // var yesterDay = moment(new Date()).subtract(1, 'days').format('yyyy-MM-ddTHH:mm:ssZ');
    // // var sevenDays = moment(new Date()).subtract(6, 'days').format('yyyy-MM-ddTHH:mm:ssZ');



    // if (this.selectedDate == 1) {
    //   servicedata = {
    //     "id": merchantStoreId,
    //     "startDate": todayDate,
    //     "endDate": nextDate
    //     // "startDate": "2023-11-27T12:54:01+0530",
    //     // "endDate": "2023-11-28T12:54:01+0530"

    //   }
    // }
    // if (this.selectedDate == 2) {
    //   servicedata = {
    //     "id": merchantStoreId,
    //     "startDate": yesterDay,
    //     "endDate": todayDate
    //   }
    // }
    // if (this.selectedDate == 3) {
    //   servicedata = {
    //     "id": merchantStoreId,
    //     "startDate": sevenDays,
    //     "endDate": todayDate
    //   }
    // }
    // if (this.selectedDate == 4) {
    //   const currentDate = new Date();
    //   // Calculate the first day of the last month
    //   let last_month_startDate = moment(new Date(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))).format('YYYY-MM-DD');
    //   console.log('startDate', last_month_startDate);
    //   // Set the end date as the current date
    //   let last_month_endDate = todayDate;
    //   console.log('endDate', last_month_endDate);

    //   servicedata = {
    //     "id": merchantStoreId,

    //     "startDate": last_month_startDate,
    //     "endDate": last_month_endDate
    //   }
    // }

    // if (this.selectedDate == 5) {
    //   servicedata = {
    //     "id": merchantStoreId,
    //     "startDate": this.startDate,
    //     "endDate": this.endDate
    //   }
    // }
    debugger
    var startDate: any;
    var endDate: any;
    var data: any;
    var currentdate = new Date();
    if (this.selectedDate == 1) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 2) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 3) {


      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 6).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';

      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 4) {
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      let firstDay = new Date(y, m, 1);
      let lastDay = new Date(y, m + 1, 0);
      startDate = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1).toString().padStart(2, '0')
        + "-" + firstDay.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }

    }
    if (this.selectedDate == 5) {
      debugger
      let getStartDate = new Date(this.startDate);
      let getEndDate = new Date(this.endDate);
      startDate = getStartDate.getFullYear() + "-" + (getStartDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getStartDate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = getEndDate.getFullYear() + "-" + (getEndDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getEndDate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    this.appointmentListService.getServiceSalesList(data).subscribe((res) => {
      loading.then((l) => l.dismiss());
      if (res && res.data.length > 0) {
        // var serviceSalesList = [
        //   {
        //     "name": "Facial For Lightening Skin",
        //     "totalPrice": 2870,
        //     "count": 3,
        //     "entriesdetails": [
        //       {
        //         "Date": "2020-11-24T06:09:21.000Z",
        //         "price": 290
        //       },
        //       {
        //         "Date": "2020-11-24T06:09:21.000Z",
        //         "price": 1290
        //       },
        //       {
        //         "Date": "2020-11-24T06:09:21.000Z",
        //         "price": 1290
        //       }
        //     ]
        //   },
        //   {
        //     "name": "Hair Spa",
        //     "totalPrice": 1388,
        //     "count": 2,
        //     "entriesdetails": [
        //       {
        //         "Date": "2020-11-24T06:11:23.000Z",
        //         "price": 500
        //       },
        //       {
        //         "Date": "2020-11-28T11:08:57.000Z",
        //         "price": 888
        //       }
        //     ]
        //   },
        //   {
        //     "name": "Colour",
        //     "totalPrice": 0,
        //     "count": 1,
        //     "entriesdetails": [
        //       {
        //         "Date": "2020-11-28T11:08:48.000Z",
        //         "price": 0
        //       }
        //     ]
        //   },
        //   {
        //     "name": "Manicure",
        //     "totalPrice": 1180,
        //     "count": 1,
        //     "entriesdetails": [
        //       {
        //         "Date": "2020-11-28T11:09:31.000Z",
        //         "price": 1180
        //       }
        //     ]
        //   }
        // ];
        var totalProductprice: number = 0;
        var filterDate: any;
        console.log('servicesalesres', res);
        var gender = this.selectedGender == 1 ? 'male' : this.selectedGender == 2 ? 'female' : 'others';
        if (this.selectedGender == 4) {
          this.getAllBillings = res.data;
          this.getAllBillings.forEach(element => {
            totalProductprice = totalProductprice + element.totalPrice;
          });
          this.totalBillValue = Math.round(totalProductprice);
        } else {
          this.getAllBillings = res.data;
          // this.getAllBillings = this.productsalesList.filter(x => x.gender == gender);
          this.getAllBillings.forEach(element => {
            totalProductprice = totalProductprice + element.totalPrice;
          });
          this.totalBillValue = Math.round(totalProductprice);
          console.log('totalProductprice', totalProductprice);

        }
        let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
        this.cashPaymentAmount = cashAmount ? cashAmount : 0;
        let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
        this.cardPaymentAmount = cardAmount ? cardAmount : 0;
        let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
        this.onlinePaymentAmount = upiAmount ? upiAmount : 0;

        this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
      }

    }, (error) => {
      loading.then((l) => l.dismiss());
    }), (error) => {
      loading.then((l) => l.dismiss());
    }
  }
  getProductSalesList() {
    debugger
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    // let data = {};
    this.getAllBillings = [];
    let id = localStorage.getItem('merchant_store_id');
    var merchantStoreId: number = 0;
    if (id) {
      merchantStoreId = JSON.parse(id)
    }
    // var todayDate = moment(new Date()).format('YYYY-MM-DD');
    // var nextDate = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    // var yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
    // var sevenDays = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');
    // if (this.selectedDate == 1) {
    //   data = {
    //     "merchantStoreId": merchantStoreId,
    //     "startDate": todayDate,
    //     "endDate": nextDate
    //   }
    // }
    // if (this.selectedDate == 2) {
    //   data = {
    //     "merchantStoreId": merchantStoreId,
    //     "startDate": yesterDay,
    //     "endDate": todayDate
    //   }
    // }
    // if (this.selectedDate == 3) {
    //   data = {
    //     "merchantStoreId": merchantStoreId,
    //     "startDate": sevenDays,
    //     "endDate": todayDate
    //   }
    // }
    // if (this.selectedDate == 4) {
    //   const currentDate = new Date();
    //   // Calculate the first day of the last month
    //   let last_month_startDate = moment(new Date(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))).format('YYYY-MM-DD');;

    //   // let last_month_startDate = moment(new Date(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))).format('YYYY-MM-DD');;
    //   console.log('startDate', last_month_startDate);
    //   // Set the end date as the current date
    //   let last_month_endDate = todayDate;
    //   console.log('endDate', last_month_endDate);

    //   data = {
    //     "merchantStoreId": merchantStoreId,
    //     "startDate": last_month_startDate,
    //     "endDate": last_month_endDate
    //   }
    // }

    // if (this.selectedDate == 5) {
    //   data = {
    //     "merchantStoreId": merchantStoreId,
    //     "startDate": this.startDate,
    //     "endDate": this.endDate
    //   }
    // }



    var startDate: any;
    var endDate: any;
    var data: any;
    var currentdate = new Date();
    if (this.selectedDate == 1) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 2) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 3) {


      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 6).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';

      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 4) {
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      let firstDay = new Date(y, m, 1);
      let lastDay = new Date(y, m + 1, 0);
      startDate = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1).toString().padStart(2, '0')
        + "-" + firstDay.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');

      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }

    }
    if (this.selectedDate == 5) {
      debugger
      let getStartDate = new Date(this.startDate);
      let getEndDate = new Date(this.endDate);
      startDate = getStartDate.getFullYear() + "-" + (getStartDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getStartDate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = getEndDate.getFullYear() + "-" + (getEndDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getEndDate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "merchantStoreId": merchantStoreId,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    this.appointmentListService.getProductSalesList(data).subscribe(res => {
      loading.then((l) => l.dismiss());
      if (res) {
        this.productsalesList = res;
        // this.getAllBillings = this.productsalesList;
        // console.log('initialget', this.getAllBillings);
        let testProductlist: any = [];
        var totalProductprice: number = 0;
        var filterDate: any;
        // if (this.selectedDate == 1) {
        //   filterDate = moment(new Date()).format('YYYY-MM-DD');
        // } else if (this.selectedDate == 2) {
        //   filterDate = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
        // }

        // for (let i = 0; i < this.productsalesList.length; i++) {
        //   debugger
        //   totalProductprice = +this.productsalesList[i].entries[0].totalPrice;
        //   console.log('totalProductprice', totalProductprice);

        //   // let data = this.productsalesList[i].entries.filter(x => x.date == filterDate);
        //   // if (data.length > 0) {
        //   //   this.productsalesList[i].entries = [];
        //   //   this.productsalesList[i].entries = data;
        //   //   totalProductprice = +this.productsalesList[i].entries[0].totalPrice;

        //   // }
        //   testProductlist.push(this.productsalesList[i])
        // }
        // this.productsalesList.forEach(element => {
        //   totalProductprice = totalProductprice + element.entries[0].totalPrice
        // });
        console.log('testProductlist', testProductlist);
        console.log('totalProductprice', totalProductprice);
        var gender = this.selectedGender == 1 ? 'male' : this.selectedGender == 2 ? 'female' : 'others';
        if (this.selectedGender == 4) {
          this.getAllBillings = this.productsalesList;
          this.getAllBillings.forEach(element => {
            totalProductprice = totalProductprice + element.entries[0].totalPrice;
          });
          this.totalBillValue = Math.round(totalProductprice);
        } else {
          this.getAllBillings = this.productsalesList.filter(x => x.gender == gender);
          this.getAllBillings.forEach(element => {
            totalProductprice = totalProductprice + element.entries[0].totalPrice;
          });
          this.totalBillValue = Math.round(totalProductprice ? totalProductprice : 0);
        }

        let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
        this.cashPaymentAmount = cashAmount ? cashAmount : 0;
        let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
        this.cardPaymentAmount = cardAmount ? cardAmount : 0;
        let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
        this.onlinePaymentAmount = upiAmount ? upiAmount : 0;

        this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
      } else {
        let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
        this.cashPaymentAmount = cashAmount ? cashAmount : 0;
        let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
        this.cardPaymentAmount = cardAmount ? cardAmount : 0;
        let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
        this.onlinePaymentAmount = upiAmount ? upiAmount : 0;

        this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.totalBillValue = Math.round(_.sumBy(this.getAllBillings, 'paidAmount'));

      }
    }, (error) => {
      loading.then((l) => l.dismiss());
    }), (error) => {
      loading.then((l) => l.dismiss());
    }
    // this.productsalesList = [{
    //   "name": "Opti.Care Smooth Straight Professional Conditioner",
    //   "entries": [{
    //     "date": "2023-11-22",
    //     "quantity": 1,
    //     "totalPrice": 150
    //   }]
    // }, {
    //   "name": "himalaya shampoo",
    //   "entries": [{
    //     "date": "2023-11-22",
    //     "quantity": 10,
    //     "totalPrice": 500
    //   }, {
    //     "date": "2023-11-23",
    //     "quantity": 3,
    //     "totalPrice": 150
    //   }, {
    //     "date": "2023-11-22",
    //     "quantity": 8,
    //     "totalPrice": 400
    //   }
    //   ]
    // }, {
    //   "name": "dove shampoo",
    //   "entries": [
    //     {
    //       "date": "2023-11-23",
    //       "quantity": 4,
    //       "totalPrice": 400
    //     },
    //     {
    //       "date": "2023-11-22",
    //       "quantity": 4,
    //       "totalPrice": 400
    //     }
    //   ]
    // }
    // ]
    // let cashPayment = this.getAllBillings.filter(x => x.modeofpayment == 'Cash');
    // this.cashPaymentAmount = _.sumBy(cashPayment, 'paidAmount');
    // // let totalCashAmount = _.sumBy(this.getAllBillings, 'paidAmount')

  }
  getStylists() {
    debugger
    this.stylistManagementService.getStylists().subscribe(
      (data) => {
        // console.log(data);
        if (data && data.status === 'SUCCESS') {
          // this.stylistData = data.data;
          // ...filterArray.map(({ id, name }) => ({ [id]: name }))
          let stylistData = [];
          stylistData = data.data.map((item) => (item.accountId));
          console.log('stylistData', stylistData);
          this.appointmentListService.storelogindetails(this.merchantStoreId).subscribe((response: any) => {
            console.log('res_______', response);
            if (response && response.length > 0) {
              let getStoreDetails = response[0];

              this.getStaffSales_byService_byProducts(stylistData, getStoreDetails)
            }


          })
          // =data.data.map({accountId:any})
        } else {
          // this.toast.showToast();
        }
      },
      (error) => {
        console.log(error);
        // this.toast.showToast();
        // reject(error);
      }
    );
  }
  getStaffSales_byService_byProducts(stylistData, store) {
    debugger
    const loading = this.loadingCtrl.create();
    loading.then((l) => l.present());
    var staff_Id = stylistData;
    this.getAllBillings = [];
    var todayDate = moment(new Date()).format('YYYY-MM-DD');
    var nextDate = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    var yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
    var sevenDays = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');
    // var currentdate = new Date();
    // var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
    //   + "-" + currentdate.getDate() + ' ' + currentdate.getHours() + ":"
    //   + currentdate.getMinutes() + ":" + currentdate.getSeconds()

    var startDate: any;
    var endDate: any;
    // if (this.selectedDate == 1) {
    //   startDate = todayDate;
    //   endDate = nextDate;
    // }
    // if (this.selectedDate == 2) {
    //   startDate = yesterDay;
    //   endDate = todayDate;
    // }
    // if (this.selectedDate == 3) {
    //   startDate = sevenDays;
    //   endDate = nextDate;
    // }
    // if (this.selectedDate == 4) {
    //   startDate = moment(new Date(new Date(new Date().getFullYear(), new Date().getMonth(), 1))).format('YYYY-MM-DD');
    //   endDate = nextDate;
    // }
    // if (this.selectedDate == 5) {
    //   startDate = this.startDate;
    //   endDate = moment(this.endDate).add(1, 'days').format('YYYY-MM-DD');
    // }
    var data: any;
    var currentdate = new Date();
    if (this.selectedDate == 1) {
      // staff_Id:stylistData
      // startDate = todayDate;
      // endDate = nextDate;
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "staff_Id": stylistData,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 2) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 1).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "staff_Id": stylistData,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 3) {
      startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate() - 6).toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + (currentdate.getDate()).toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "staff_Id": stylistData,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    if (this.selectedDate == 4) {
      var date = new Date(), y = date.getFullYear(), m = date.getMonth();
      let firstDay = new Date(y, m, 1);
      let lastDay = new Date(y, m + 1, 0);
      startDate = firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1).toString().padStart(2, '0')
        + "-" + firstDay.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      // endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      //   + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":"
      //   + currentdate.getMinutes().toString().padStart(2, '0');
      endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "staff_Id": stylistData,
        "start_date": startDate,
        "end_date": endDate
      }

    }
    if (this.selectedDate == 5) {
      // startDate = this.startDate;
      // endDate = moment(this.endDate).add(1, 'days').format('YYYY-MM-DD');
      let getStartDate = new Date(this.startDate);
      let getEndDate = new Date(this.endDate);
      startDate = getStartDate.getFullYear() + "-" + (getStartDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getStartDate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
        + '00';
      endDate = getEndDate.getFullYear() + "-" + (getEndDate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + getEndDate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
        + '00';
      data = {
        "staff_Id": stylistData,
        "start_date": startDate,
        "end_date": endDate
      }
    }
    console.log('startDate', startDate);
    console.log('enddate', endDate);


    this.appointmentListService.StaffReport(data).subscribe(res => {
      loading.then((l) => l.dismiss());
      if (res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          // if (res.data[i].service && res.data[i].service.length > 0) {
          //   res.data[i].service = res.data[i].service.filter(x => moment(new Date(x.date)).format('YYYY-MM-DD') >= startDate && moment(new Date(x.date)).format('YYYY-MM-DD') < endDate);
          // }
          // if (res.data[i].product && res.data[i].product.length > 0) {
          //   res.data[i].product = res.data[i].product.filter(x => moment(new Date(x.date)).format('YYYY-MM-DD') >= startDate && moment(new Date(x.date)).format('YYYY-MM-DD') < endDate);
          // }
          let totalService = _.sumBy(res.data[i].service, 'price');
          let totalProduct = _.sumBy(res.data[i].product, 'price');
          let total = totalService + totalProduct;
          // let totalClients = res.data[i].service.length + res.data[i].product.length;
          let totalClients = res.data[i].Billcount;

          var ABV: any
          if (total > 0 && total > totalClients) {
            let formateABV = (total / totalClients) > 0 ? (total / totalClients).toFixed(2) : 0;
            ABV = formateABV
          } else {
            ABV = 0;
          }
          let serviceDailyIncentive = res.data[i].daily_incentive_service ? res.data[i].daily_incentive_service : 0;
          let productDailyIncentive = res.data[i].daily_incentive_product ? res.data[i].daily_incentive_product : 0;
          let serviceMonthlyIncentive = res.data[i].month_incentive_service ? res.data[i].month_incentive_service : 0;
          let productMonthlyIncentive = res.data[i].month_incentive_product ? res.data[i].month_incentive_product : 0;
          let daily_incentiveServiceBy: any;
          let daily_incentiveProductBy: any;
          let monthly_incentiveServiceBy: any;
          let monthly_incentiveProductBy: any;
          let SI_daily = store.SI_percentage_Daily ? JSON.parse(store.SI_percentage_Daily) : 0;
          let PI_daily = store.PI_percentage_Daily ? JSON.parse(store.PI_percentage_Daily) : 0;
          let SI_monthly = store.SI_percentage_Montly ? JSON.parse(store.SI_percentage_Montly) : 0;
          let PI_monthly = store.PI_percentage_Montly ? JSON.parse(store.PI_percentage_Montly) : 0;

          daily_incentiveServiceBy = res.data[i].service_totalprice >= serviceDailyIncentive ? Math.round((res.data[i].service_totalprice * SI_daily) / 100) : 0;
          daily_incentiveProductBy = res.data[i].product_totalprice >= productDailyIncentive ? Math.round((res.data[i].product_totalprice * PI_daily) / 100) : 0;

          monthly_incentiveServiceBy = res.data[i].service_totalprice >= serviceMonthlyIncentive ? Math.round((res.data[i].service_totalprice * SI_monthly) / 100) : 0;
          monthly_incentiveProductBy = res.data[i].product_totalprice >= productMonthlyIncentive ? Math.round((res.data[i].product_totalprice * PI_monthly) / 100) : 0;

          console.log('daily_incentiveServiceBy', daily_incentiveServiceBy);
          console.log('daily_incentiveProductBy', daily_incentiveProductBy);
          console.log('monthly_incentiveServiceBy', monthly_incentiveServiceBy);
          console.log('monthly_incentiveProductBy', monthly_incentiveProductBy);

          if (res.data[i].product.length > 0 || res.data[i].service.length > 0) {
            let dailyData = {
              serviceName: res.data[i].first_name,
              serviceTotal: _.sumBy(res.data[i].service, 'price'),
              productTotal: _.sumBy(res.data[i].product, 'price'),
              total: total,
              noofClients: totalClients,
              ABV: ABV,
              billcount: totalClients,
              serviceIncentive: this.selectSalesPerformance == 1 ? daily_incentiveServiceBy : monthly_incentiveServiceBy,
              productIncentive: this.selectSalesPerformance == 1 ? daily_incentiveProductBy : monthly_incentiveProductBy,
              // serviceIncentive: this.selectSalesPerformance == 1 ? serviceDailyIncentive : serviceMonthlyIncentive,
              // productIncentive: this.selectSalesPerformance == 1 ? productDailyIncentive : productMonthlyIncentive,

            }
            // dailyReportList.push(dailyData);
            this.getAllBillings.push(dailyData);
            this.totalBillValue = Math.round(_.sumBy(this.getAllBillings, 'total'));

            console.log('dailyReportList_____________', this.getAllBillings);

          }

        }
        let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
        this.cashPaymentAmount = cashAmount ? cashAmount : 0;
        let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
        this.cardPaymentAmount = cardAmount ? cardAmount : 0;
        let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
        this.onlinePaymentAmount = upiAmount ? upiAmount : 0;
        this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        // this.totalAmount();

      } else {
        this.totalBillValue = Math.round(_.sumBy(this.getAllBillings, 'total'));
        let cashAmount = _.sumBy(this.getAllBillings, 'cash_paid_amount');
        this.cashPaymentAmount = cashAmount ? cashAmount : 0;
        let cardAmount = _.sumBy(this.getAllBillings, 'card_paid_amount');
        this.cardPaymentAmount = cardAmount ? cardAmount : 0;
        let upiAmount = _.sumBy(this.getAllBillings, 'upi_paid_amount');
        this.onlinePaymentAmount = upiAmount ? upiAmount : 0;
        this.cashPercentage = this.cashPaymentAmount > 0 ? Math.round((this.cashPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.cardPercentage = this.cardPaymentAmount > 0 ? Math.round((this.cardPaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        this.upiPercentage = this.onlinePaymentAmount > 0 ? Math.round((this.onlinePaymentAmount / (this.cashPaymentAmount + this.cardPaymentAmount + this.onlinePaymentAmount)) * 10) / 10 : 0;
        // this.totalAmount();

      }
    }, (error) => {
      loading.then((l) => l.dismiss());
    }), (error) => {
      loading.then((l) => l.dismiss());
    }
  }

  onChangeSalesPerformance(event: any) {
    console.log('event', event.detail);
    // if (event && event.detail.value == 1) {

    // } else {

    // }
    this.getStylists();
    debugger
  }
  onChangeDate(event: any) {
    debugger
    if (this.selectedCategory == 1) {
      // old
      // var gender = this.selectedGender == 1 ? 'male' : this.selectedGender == 2 ? 'female' : 'others';
      // // console.log('datetype', this.selectedDate);
      // // console.log('newdate', new Date());
      // // console.log('form', new Date().toISOString);
      // // var a = moment.utc(new Date()).tz("Asia/Taipei");
      // // a.format()
      // // console.log('final', a.utc().format());
      // // let toDaydate = JSON.stringify(moment(new Date()).format('YYYY-MM-DDTHH:MM:SSZ'));
      // let toDaydate = moment(new Date()).format('YYYY-MM-DD');
      // console.log('todaydate', toDaydate);
      // // let newM = moment(toDaydate, "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).local();
      // // console.log('newM', newM);
      // if (this.selectedDate && this.selectedGender == 4) {
      //   if (this.selectedDate == 1) {
      //     this.getAllBillings = this.getBillings.filter(x => x.created_at == toDaydate);
      //     console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 2) {
      //     let yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
      //     console.log('yesterDay', yesterDay);
      //     this.getAllBillings = this.getBillings.filter(x => x.created_at == yesterDay);
      //     console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 3) {
      //     let before7Days = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');
      //     console.log('before7Days', before7Days);
      //     this.getAllBillings = this.getBillings.filter(x => x.created_at >= before7Days && x.created_at <= toDaydate);
      //     // console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 4) {
      //     let currentMonth = new Date().getMonth() + 1;
      //     console.log('currentMonth', currentMonth);
      //     this.getAllBillings = this.getBillings.filter(x => new Date(x.created_at).getMonth() + 1 == currentMonth);
      //     // console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 5) {
      //     var startDate: any;
      //     var endDate: any;
      //     if (this.startDate && !this.endDate) {
      //       startDate = moment(this.startDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => x.created_at >= startDate);
      //     }
      //     if (this.endDate && !this.startDate) {
      //       endDate = moment(this.endDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => x.created_at <= endDate);
      //     }
      //     if (this.startDate && this.endDate) {
      //       startDate = moment(this.startDate).format('YYYY-MM-DD');
      //       endDate = moment(this.endDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => (x.created_at >= startDate) && (x.created_at <= endDate));
      //     }
      //     this.showCustomeDate = true;
      //   }
      // } else if (this.selectedDate && this.selectedGender != 4) {
      //   if (this.selectedDate == 1) {
      //     this.getAllBillings = this.getBillings.filter(x => x.created_at == toDaydate && x.gender == gender);
      //     console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 2) {
      //     let yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
      //     console.log('yesterDay', yesterDay);
      //     this.getAllBillings = this.getBillings.filter(x => x.created_at == yesterDay && x.gender == gender);
      //     console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 4) {
      //     let currentMonth = new Date().getMonth() + 1;
      //     console.log('currentMonth', currentMonth);
      //     this.getAllBillings = this.getBillings.filter(x => (new Date(x.created_at).getMonth() + 1 == currentMonth) && x.gender == gender);
      //     // console.log('gett', this.getAllBillings);
      //   }
      //   if (this.selectedDate == 5) {
      //     var startDate: any;
      //     var endDate: any;
      //     if (this.startDate && !this.endDate) {
      //       startDate = moment(this.startDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => x.created_at >= startDate && x.gender == gender);
      //     }
      //     if (this.endDate && !this.startDate) {
      //       endDate = moment(this.endDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => x.created_at <= endDate && x.gender == gender);
      //     }
      //     if (this.startDate && this.endDate) {
      //       startDate = moment(this.startDate).format('YYYY-MM-DD');
      //       endDate = moment(this.endDate).format('YYYY-MM-DD');
      //       this.getAllBillings = this.getBillings.filter(x => ((x.created_at >= startDate) && (x.created_at <= endDate)) && x.gender == gender);
      //     }
      //     this.showCustomeDate = true;
      //   } else {
      //     this.startDate = '';
      //     this.endDate = '';
      //     this.showCustomeDate = false;

      //   }

      // } else if (this.selectedGender && !this.selectedDate) {
      //   let genderList = [];
      //   genderList = this.getBillings.filter(x => x.gender == gender);
      //   this.getAllBillings = genderList;
      // }
      // this.totalAmount();
      if (this.selectedDate == 5) {
        this.showCustomeDate = true;
        this.getAllBillings = [];
        this.totalAmount();
      } else {
        this.startDate = '';
        this.endDate = '';
        this.showCustomeDate = false;
        this.getBillingByStoreId();

      }
    } else if (this.selectedCategory == 2) {
      if (this.selectedDate == 5) {
        this.showCustomeDate = true;
      } else {
        this.startDate = '';
        this.endDate = '';
        this.showCustomeDate = false;

      }
      this.getServiceSalesList();

    } else if (this.selectedCategory == 3) {
      if (this.selectedDate == 5) {
        this.showCustomeDate = true;
      } else {
        this.startDate = '';
        this.endDate = '';
        this.showCustomeDate = false;

      }
      this.getProductSalesList()
    } else if (this.selectedCategory == 4) {
      if (this.selectedDate == 5) {
        this.showCustomeDate = true;
      } else {
        this.startDate = '';
        this.endDate = '';
        this.showCustomeDate = false;

      }
      this.getStylists();
    }
  }
  downloadPdf(divRef) {
    let images = divRef.getElementsByTagName('img');

    // console.log(images[0].src);

    //    doc.addImage('https://via.placeholder.com/150');
    // console.log(divRef);
    // const div = document.getElementById('print-paper');
    html2canvas(divRef)
      .then((successRef) => {
        var doc = new jsPDF('p', 'mm', 'a4');
        var img = successRef.toDataURL('image/png');

        // Add image Canvas to PDF
        const bufferX = 5;
        const bufferY = 5;
        const imgProps = (<any>doc).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 4 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((doc) => doc.save('Receipt.pdf'));

  }
  convert() {
    let currentdate = new Date();
    let formaateDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":" + currentdate.getMinutes().toString().padStart(2, '0');
    console.log('formate', formaateDate);
    const loading = this.loadingCtrl.create();

    try {
      loading.then((l) => l.present());
      let currentdate = new Date();
      let formaateDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
        + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + currentdate.getHours().toString().padStart(2, '0') + ":" + currentdate.getMinutes().toString().padStart(2, '0');
      console.log('formate', formaateDate);

      let getExportdata = [];
      var fileName: any;
      let headerName: any = [];
      let selectedDatetype: any;
      if (this.selectedDate != 5) {
        selectedDatetype = this.dateTypeList.filter(x => x.id == this.selectedDate)
          .map(data => data.name)
      } else {
        let getStartDate = new Date(this.startDate);
        let getEndDate = new Date(this.endDate);
        let startDate = getStartDate.getFullYear() + "-" + (getStartDate.getMonth() + 1).toString().padStart(2, '0')
          + "-" + getStartDate.getDate().toString().padStart(2, '0');
        let endDate = getEndDate.getFullYear() + "-" + (getEndDate.getMonth() + 1).toString().padStart(2, '0')
          + "-" + getEndDate.getDate().toString().padStart(2, '0');
        selectedDatetype = startDate + ' ' + '-' + ' ' + endDate
      }

      if (this.selectedCategory == 1) {
        fileName = 'Sales List';
        headerName = ['s.no', 'Order ID', 'Date', 'Customer Name', 'Customer Mobile Number', 'Payment Mode', 'Net Total', 'Tax', 'Gross'];
        this.getAllBillings.forEach((element, index) => {
          let data = [
            index + 1,
            element.bill_id,
            element.created_at,
            element.customer_name ? element.customer_name : '',
            element.searchMobileNo ? element.searchMobileNo : '',
            element.modeofpayment,
            element.amount,
            element.CGST + element.SGST,
            element.Grandtotal,
          ]
          getExportdata.push(data)
        });


      } else if (this.selectedCategory == 2) {
        fileName = 'Service Sales List';
        headerName = ['s.no', 'Service Name', 'Qty Sold', 'Gross Total'];

        this.getAllBillings.forEach((element, index) => {
          let data = [
            index + 1,
            element.name,
            element.count,
            element.totalPrice,

          ]
          getExportdata.push(data)
        });

      } else if (this.selectedCategory == 3) {
        fileName = 'Product Sales List';
        headerName = ['s.no', 'Product Name', 'Quantity', 'Total Amount']

        this.getAllBillings.forEach((element, index) => {
          let data = [
            index + 1,
            element.name,
            element.entries[0].quantity,
            element.entries[0].totalPrice,
          ]
          getExportdata.push(data)
        });
      } else {
        if (this.selectSalesPerformance == 1) {
          fileName = 'Staff Sales Daily performance List';

        } else {
          fileName = 'Staff Sales Monthly performance List';

        }
        headerName = ['s.no', 'Staff Name', 'Service', 'Product', 'Total', 'No of Clients', 'ABV', 'Service Incentive', 'Product Incentive'];
        this.getAllBillings.forEach((element, index) => {
          let data = [
            index + 1,
            element.serviceName,
            element.serviceTotal,
            element.productTotal,
            element.total,
            element.noofClients,
            element.ABV,
            element.serviceIncentive,
            element.productIncentive
          ]
          getExportdata.push(data)
        });

      }
      // const arrayOfArrays = getExportdata.map(obj => Object.values(obj));

      console.log('getExportdata', getExportdata);


      const doc = new jsPDF();
      const imageUrl = '../../assets/Bocxy_logo.png'; // Replace with the path to your image
      // doc.addImage(imageUrl, 'png', 70, 10, 40, 40);
      const imageWidth = 25; // Adjust the image width as needed
      const pdfWidth = doc.internal.pageSize.getWidth();

      // const imageX = (pdfWidth - imageWidth) / 2;
      const imageX = 10;

      const imageY = 5; // Adjust the top margin as needed

      // doc.addImage(imageUrl, 'png', imageX, imageY, imageWidth, imageWidth);


      // doc.text(fileName + ' ' + '-' + ' ' + selectedDatetype + ':', 14, 15, { align: "center" });
      let cellWidth = this.selectedCategory == 1 || this.selectedCategory == 4 ? {

        0: { cellWidth: 12 }, // Set width for column 0
        1: { cellWidth: 28 }, // Set width for column 1
        // Add more column styles as needed
      } : {

      };
      autoTable(doc, {
        head: [headerName],
        body: getExportdata,
        theme: 'grid', // 'striped', 'grid', 'plain', or 'css' (default is 'striped')
        headStyles: {
          fillColor: [14, 31, 83],
          // Header background color
          textColor: 255, // Header text color
          // textColor: '#0E1F5',
          fontSize: 10 // Header font size
        },
        bodyStyles: {
          textColor: 0, // Body text color
          fontSize: 10 // Body font size
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255] // Alternate row background color
        },
        columnStyles: cellWidth,
        margin: { top: 30 },
        pageBreak: 'auto',
        didDrawPage: (data) => {
          // console.log('data', data.pageCount);
          doc.addImage(imageUrl, 'png', imageX, imageY, imageWidth, 15);
          doc.setTextColor(14, 31, 83);
          let titleX = this.selectedDate != 5 ? 70 : 90
          let titleY = 15
          // doc.text(fileName + ' ' + '-' + ' ' + selectedDatetype + ':', titleX, titleY, { align: "center" });
          doc.text(fileName + ' ' + '-' + ' ' + selectedDatetype + ':', doc.internal.pageSize.getWidth() / 2, titleY, { align: "center" });

          doc.setFontSize(10);
          let subTitle;
          if (this.selectedCategory == 1) {
            subTitle = 'No of Bills:' + ' ' + this.getAllBillings.length + ', ' + 'Total Bill Value:' + ' ' + this.totalBillValue + ', ' + 'Cash:' + ' ' + this.cashPaymentAmount + ', ' + 'Card:' + ' ' + this.cardPaymentAmount + ', ' + 'UPI:' + ' ' + this.onlinePaymentAmount;
          } else {
            subTitle = 'No of Bills:' + ' ' + this.getAllBillings.length + ', ' + 'Total Bill Value:' + ' ' + this.totalBillValue;

          }
          // doc.text(subTitle, titleX, 25, { align: "center" });
          doc.text(subTitle, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
          // doc.setFontSize(10);
          doc.text('Page:' + ' ' + data.pageNumber + ', ' + 'Generated on: ' + formaateDate, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        },
      },)
      if (this.getAllBillings.length > 0) {
        setTimeout(() => {
          loading.then((l) => l.dismiss());

          doc.save(fileName + '.pdf')


        }, 100);

      } else {
        this.toast.showToast('No Data Available');

      }
    } catch (error) {
      loading.then((l) => l.dismiss());

    }
    debugger


  }

  exportexcel(divref): void {
    var fileName: any;
    let salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
    let getExportdata = [];
    if (this.selectedCategory == 1) {
      fileName = 'Sales List';
      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          "Order ID": element.bill_id,
          "Date": element.created_at,
          "Customer Name": element.customer_name ? element.customer_name : '',
          "Customer Mobilenumber": element.searchMobileNo ? element.searchMobileNo : '',
          "Payment Mode": element.modeofpayment,
          "Net Total": element.amount,
          "Tax": element.CGST + element.SGST,
          "Gross": element.Grandtotal,
        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }

    if (this.selectedCategory == 2) {
      fileName = 'Service Sales List';
      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          "Service Name": element.name,
          "Qty Sold": element.count,
          "Gross Total": element.totalPrice,

        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }
    if (this.selectedCategory == 3) {
      fileName = 'Product Sales List';

      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          // "Date": element.entries[0].date,
          // "Product Id": index + 1,
          "Product Name": element.name,
          "Quantity": element.entries[0].quantity,
          "Total Amount": element.entries[0].totalPrice,
          // "Purchased By": ''
        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }
    if (this.selectedCategory == 4) {
      if (this.selectSalesPerformance == 1) {
        fileName = 'Staff Sales Daily performance List';

      } else {
        fileName = 'Staff Sales Monthly performance List';

      }

      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          "Staff Name": element.serviceName,
          "Service": element.serviceTotal,
          "Product": element.productTotal,
          "Total": element.total,
          "No of Bills": element.billcount,
          "ABV": element.ABV,
          "Service Incentive": element.serviceIncentive,
          "Product Incentive": element.productIncentive
        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }
    /* pass here the table id */
    // let element = document.getElementById(divref);
    // let jsonData: any[] = [
    //   { name: 'John', age: 30, city: 'New York' },
    //   { name: 'Alice', age: 25, city: 'San Francisco' },
    //   // Add more data as needed
    // ];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(getExportdata);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
  startDateChange() {
    console.log('startDate', this.startDate);
    console.log('endDate', this.endDate);
    // if (this.selectedCategory == 1) {
    //   this.onChangeDate(event);
    // }
    // if (this.selectedCategory == 2) {
    //   this.getServiceSalesList();
    // }
    // if (this.selectedCategory == 3) {
    //   this.getProductSalesList();
    // }
    // if (this.selectedCategory == 4) {
    //   this.getStylists();
    // }
  }
  endDateChange() {
    console.log('startDate', this.startDate);
    console.log('endDate', this.endDate);
    // this.onChangeDate(event);
    if (this.selectedCategory == 1) {
      // this.onChangeDate(event);
      this.getBillingByStoreId();
    }
    if (this.selectedCategory == 2) {
      this.getServiceSalesList();
    }
    if (this.selectedCategory == 3) {
      this.getProductSalesList();
    }
    if (this.selectedCategory == 4) {
      this.getStylists();
    }
  }
  onChangeGender(event: any) {
    if (this.selectedCategory == 1) {
      this.getBillingByStoreId();

    }


  }
  goToBilling(item: any, type: any) {
    var receiptDetails: any;
    this.httpService.getReportsProductDetails(item.bill_id).subscribe(resproducts => {
      if (resproducts.data.length > 0) {
        receiptDetails = resproducts.data[0];
        resproducts.data.forEach(element => {
          if (element.products.length > 0) {
            element.products.forEach(products => {
              products.productName = products.product_name
              products.choosequantity = products.Quantity
              products.choosediscount = products.discount
              products.totalprice = products.Price
            });
          }

        });
        if (item.type == "Products") {
          this.router.navigate(['billing', { id: 1, type: type, value: JSON.stringify(resproducts.data[0]) }]);
        } else {
          this.httpService.getReportsServiceDetails(item.bill_id).subscribe(res => {
            if (res && res.data.length > 0) {
              receiptDetails.products = resproducts.data[0].products;
              receiptDetails.bookedServices = res.data[0].bookedServices;
              receiptDetails.appointmentId = res.data[0].appointmentId;
              console.log('receiptDetails', receiptDetails);
              this.router.navigate(['billing', { id: 1, type: type, value: JSON.stringify(receiptDetails) }]);

            } else {
            }
          })
        }

      }
    })
    // if (item.type == "Products") {


    // } else {

    // }





  }
  applyFilter() {

  }



  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllBillings.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
  }
}
