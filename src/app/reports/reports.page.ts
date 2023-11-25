import { Component, OnInit } from '@angular/core';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';


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
  constructor(private appointmentListService: AppointmentListService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private datePipe: DatePipe) { }

  ngOnInit() {
    // this.getAllBillings();
    this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Net Total" }, { name: "Tax" }, { name: "Gross" }, { name: "Action" }];
    const dbDate = new Date('2023-11-21T20:14:13.000Z');
    const formattedDate = this.datePipe.transform(dbDate, 'yyyy-MM-dd');
    console.log('formattedDate', formattedDate);
    this.selectedCategory = 1;
    this.selectedDate = 1;
    this.selectedGender = 4;
    console.log('oninit');

  }
  ionViewWillEnter() {
    console.log('willenter');

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
    console.log('date', moment(new Date('2023-11-21T20:14:13.000Z')).format('YYYY-MM-DD'));
    let iso = new Date('2023-11-21T20:14:13.000Z').toISOString;
    console.log('iso', iso);
    let storeId: number = 352;
    let id = localStorage.getItem('merchant_store_id');
    let merchantStoreId: number;
    if (id) {
      merchantStoreId = JSON.parse(id)
    }

    this.appointmentListService.getByStore(merchantStoreId).subscribe(res => {
      if (res && res.data.length > 0) {
        res.data.forEach(element => {
          if (element.paidAmount) {
            element.paidAmount = JSON.parse(element.paidAmount)
          }
          if (element.created_at) {
            console.log('created_at', element.created_at);
            let date = moment(new Date(element.created_at)).format('YYYY-MM-DD');
            console.log('formatedate', date);
            element.created_at = date;
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
          if (element.Grandtotal) {
            element.Grandtotal = JSON.parse(element.Grandtotal);
          }
        });

        this.getBillings = res.data;
        this.getAllBillings = this.getBillings;
        console.log('initialget', this.getAllBillings);
        this.onChangeDate('event');
      }
    })
  }
  totalAmount() {
    let cashPayment = this.getAllBillings.filter(x => x.modeofpayment == 'Cash');
    this.cashPaymentAmount = _.sumBy(cashPayment, 'paidAmount');
    // let totalCashAmount = _.sumBy(this.getAllBillings, 'paidAmount')
    this.totalBillValue = _.sumBy(this.getAllBillings, 'Grandtotal');
    console.log('getAllBillings', this.getAllBillings);
  }
  onChangeCategory(event: any) {
    if (this.selectedCategory == 1) {
      // this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
      this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Net Total" }, { name: "Tax" }, { name: "Gross" }, { name: "Action" }];

      this.getSaleslist();
    }
    if (this.selectedCategory == 2) {
      this.salesList = [{ name: "S.no" }, { name: "Service Name" }, { name: "Qty Sold" }, { name: "Consumed Products" }, { name: "Net Total" }, { name: "Tax Total" }, { name: "Gross Total" }];
      this.getServiceSalesList()
    }
    if (this.selectedCategory == 3) {
      this.salesList = [{ name: "S.no" }, { name: "Date" }, { name: "Product Id" }, { name: "Product Name" }, { name: "Quantity" }, { name: "Total Amount" }, { name: "Purchased By" }, { name: "Action" }];
      this.getProductSalesList();
    }
    if (this.selectedCategory == 4) {
      this.staffSalesByService = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service Amount" }, { name: "Discount Amount" }, { name: "Commission / Tip" }, { name: "Duration (Minutes)" }, { name: "Total Amount" }, { name: "Action" }];
      this.staffSalesByProduct = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Product Amount" }, { name: "Discount Amount" }, { name: "Commission" }, { name: "Total Amount" }, { name: "Action" }];
    }
  }
  getSaleslist() {
    // this.getAllBillings = this.getBillings;
    this.getBillingByStoreId();

    // this.onChangeDate('event');
  }
  getServiceSalesList() {

  }
  getProductSalesList() {
    let data = {}
    var todayDate = moment(new Date()).format('YYYY-MM-DD');
    var nextDate = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
    var yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
    var sevenDays = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');
    if (this.selectedDate == 1) {

      data = {
        "startDate": todayDate,
        "endDate": nextDate
      }
    }
    if (this.selectedDate == 2) {
      data = {
        "startDate": yesterDay,
        "endDate": todayDate
      }
    }
    if (this.selectedDate == 3) {
      data = {
        "startDate": sevenDays,
        "endDate": todayDate
      }
    }
    if (this.selectedDate == 4) {
      const currentDate = new Date();
      // Calculate the first day of the last month
      let last_month_startDate = moment(new Date(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))).format('YYYY-MM-DD');;
      console.log('startDate', last_month_startDate);
      // Set the end date as the current date
      let last_month_endDate = todayDate;
      console.log('endDate', last_month_endDate);

      data = {
        "startDate": last_month_startDate,
        "endDate": last_month_endDate
      }
    }

    if (this.selectedDate == 5) {
      data = {
        "startDate": this.startDate,
        "endDate": this.endDate
      }
    }
    this.appointmentListService.getProductSalesList(data).subscribe(res => {
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
          this.totalBillValue = totalProductprice;
        } else {
          this.getAllBillings = this.productsalesList.filter(x => x.gender == gender);
          this.getAllBillings.forEach(element => {
            totalProductprice = totalProductprice + element.entries[0].totalPrice;
          });
          this.totalBillValue = totalProductprice;
        }
      }
    })
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
    let cashPayment = this.getAllBillings.filter(x => x.modeofpayment == 'Cash');
    this.cashPaymentAmount = _.sumBy(cashPayment, 'paidAmount');
    // let totalCashAmount = _.sumBy(this.getAllBillings, 'paidAmount')
    this.totalBillValue = _.sumBy(this.getAllBillings, 'paidAmount');
  }
  onChangeDate(event: any) {
    debugger
    if (this.selectedCategory == 1) {
      var gender = this.selectedGender == 1 ? 'male' : this.selectedGender == 2 ? 'female' : 'others';
      // console.log('datetype', this.selectedDate);
      // console.log('newdate', new Date());
      // console.log('form', new Date().toISOString);
      // var a = moment.utc(new Date()).tz("Asia/Taipei");
      // a.format()
      // console.log('final', a.utc().format());
      // let toDaydate = JSON.stringify(moment(new Date()).format('YYYY-MM-DDTHH:MM:SSZ'));
      let toDaydate = moment(new Date()).format('YYYY-MM-DD');
      console.log('todaydate', toDaydate);
      // let newM = moment(toDaydate, "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).local();
      // console.log('newM', newM);
      if (this.selectedDate && this.selectedGender == 4) {
        if (this.selectedDate == 1) {
          this.getAllBillings = this.getBillings.filter(x => x.created_at == toDaydate);
          console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 2) {
          let yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
          console.log('yesterDay', yesterDay);
          this.getAllBillings = this.getBillings.filter(x => x.created_at == yesterDay);
          console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 3) {
          let before7Days = moment(new Date()).subtract(6, 'days').format('YYYY-MM-DD');
          console.log('before7Days', before7Days);
          this.getAllBillings = this.getBillings.filter(x => x.created_at >= before7Days && x.created_at <= toDaydate);
          // console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 4) {
          let currentMonth = new Date().getMonth() + 1;
          console.log('currentMonth', currentMonth);
          this.getAllBillings = this.getBillings.filter(x => new Date(x.created_at).getMonth() + 1 == currentMonth);
          // console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 5) {
          var startDate: any;
          var endDate: any;
          if (this.startDate && !this.endDate) {
            startDate = moment(this.startDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => x.created_at >= startDate);
          }
          if (this.endDate && !this.startDate) {
            endDate = moment(this.endDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => x.created_at <= endDate);
          }
          if (this.startDate && this.endDate) {
            startDate = moment(this.startDate).format('YYYY-MM-DD');
            endDate = moment(this.endDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => (x.created_at >= startDate) && (x.created_at <= endDate));
          }
          this.showCustomeDate = true;
        }
      } else if (this.selectedDate && this.selectedGender != 4) {
        if (this.selectedDate == 1) {
          this.getAllBillings = this.getBillings.filter(x => x.created_at == toDaydate && x.gender == gender);
          console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 2) {
          let yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
          console.log('yesterDay', yesterDay);
          this.getAllBillings = this.getBillings.filter(x => x.created_at == yesterDay && x.gender == gender);
          console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 4) {
          let currentMonth = new Date().getMonth() + 1;
          console.log('currentMonth', currentMonth);
          this.getAllBillings = this.getBillings.filter(x => (new Date(x.created_at).getMonth() + 1 == currentMonth) && x.gender == gender);
          // console.log('gett', this.getAllBillings);
        }
        if (this.selectedDate == 5) {
          var startDate: any;
          var endDate: any;
          if (this.startDate && !this.endDate) {
            startDate = moment(this.startDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => x.created_at >= startDate && x.gender == gender);
          }
          if (this.endDate && !this.startDate) {
            endDate = moment(this.endDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => x.created_at <= endDate && x.gender == gender);
          }
          if (this.startDate && this.endDate) {
            startDate = moment(this.startDate).format('YYYY-MM-DD');
            endDate = moment(this.endDate).format('YYYY-MM-DD');
            this.getAllBillings = this.getBillings.filter(x => ((x.created_at >= startDate) && (x.created_at <= endDate)) && x.gender == gender);
          }
          this.showCustomeDate = true;
        }

      } else if (this.selectedGender && !this.selectedDate) {
        let genderList = [];
        genderList = this.getBillings.filter(x => x.gender == gender);
        this.getAllBillings = genderList;
      }
      this.totalAmount();
      // if (this.selectedGender) {
      //   let genderList = [];
      //   genderList = this.getBillings.filter(x => x.gender == this.selectedGender );
      //   if (genderList.length > 0) {
      //     this.getAllBillings.concat(genderList);
      //   }
      // }
      // let date = new Date();
      // let getByDate = this.getBillings.filter(x => x.dueDate == date)
      // console.log('getdate', getByDate);
    } else if (this.selectedCategory == 3) {
      this.getProductSalesList()
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

  exportexcel(divref): void {
    var fileName: any;
    let salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
    let getExportdata = [];
    if (this.selectedCategory == 1) {
      fileName = 'SalesList';
      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          "Order ID": element.bill_id,
          "Date": element.created_at,
          "Customer Name": element.customer_name ? element.customer_name : 'shan',
          "Payment Mode": element.modeofpayment,
          "Amount": element.paidAmount
        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }
    if (this.selectedCategory == 3) {
      this.salesList = [{ name: "S.no" }, { name: "Date" }, { name: "Product Id" }, { name: "Product Name" }, { name: "Quantity" }, { name: "Total Amount" }, { name: "Purchased By" }, { name: "Action" }];
      this.getAllBillings.forEach((element, index) => {
        let data = {
          's.no': index + 1,
          "Date": element.entries[0].date,
          "Product Id": index + 1,
          "Product Name": element.name,
          "Quantity": element.entries[0].quantity,
          "Total Amount": element.entries[0].totalPrice,
          "Purchased By": 'shan'
        }
        getExportdata.push(data)
      });
      console.log('getExportdata', getExportdata);
    }

    /* pass here the table id */
    let element = document.getElementById(divref);
    let jsonData: any[] = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Alice', age: 25, city: 'San Francisco' },
      // Add more data as needed
    ];
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(getExportdata);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${'salesList'}.xlsx`);
  }
  startDateChange() {
    console.log('startDate', this.startDate);
    console.log('endDate', this.endDate);
    this.onChangeDate(event);
  }
  endDateChange() {
    console.log('startDate', this.startDate);
    console.log('endDate', this.endDate);
    this.onChangeDate(event);
  }
  onChangeGender(event: any) {
    this.onChangeDate(event);
  }
  goToBilling(type: any) {
    if (type == 1) {
      this.router.navigate(['billing', { id: 1 }]);

    }

  }

  // getPDF(){

  // 	var HTML_Width = $(".canvas_div_pdf").width();
  // 	var HTML_Height = $(".canvas_div_pdf").height();
  // 	var top_left_margin = 15;
  // 	var PDF_Width = HTML_Width+(top_left_margin*2);
  // 	var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
  // 	var canvas_image_width = HTML_Width;
  // 	var canvas_image_height = HTML_Height;

  // 	var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;


  // 	html2canvas($(".canvas_div_pdf")[0],{allowTaint:true}).then(function(canvas) {
  // 		canvas.getContext('2d');

  // 		console.log(canvas.height+"  "+canvas.width);


  // 		var imgData = canvas.toDataURL("image/jpeg", 1.0);
  // 		var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
  // 	    pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);


  // 		for (var i = 1; i <= totalPDFPages; i++) { 
  // 			pdf.addPage(PDF_Width,PDF_Height);
  // 			pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
  // 		}

  // 	    pdf.save("HTML-Document.pdf");
  //       });
  // };
}
