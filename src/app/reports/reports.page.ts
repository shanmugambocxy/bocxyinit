import { Component, OnInit } from '@angular/core';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as _ from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';


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
  genterTypeList: any = [{ name: "male" }, { name: "female" }, { name: "others" }];
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
  constructor(private appointmentListService: AppointmentListService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

  ngOnInit() {
    // this.getAllBillings();
    this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];

    this.getBillingByStoreId();
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
    let storeId: number = 352;
    this.appointmentListService.getByStore(storeId).subscribe(res => {
      if (res && res.data.length > 0) {
        res.data.forEach(element => {
          if (element.paidAmount) {
            element.paidAmount = JSON.parse(element.paidAmount)
          }
          if (element.created_at) {
            element.created_at = moment(element.created_at).format('YYYY-MM-DD');
          }
          if (element.gender) {
            element.gender = (element.gender).toLowerCase()
          }
        });
        this.getBillings = res.data;
        this.getAllBillings = this.getBillings;
        this.totalAmount();
      }
    })
  }
  totalAmount() {
    let cashPayment = this.getAllBillings.filter(x => x.modeofpayment == 'Cash');
    this.cashPaymentAmount = _.sumBy(cashPayment, 'paidAmount');
    // let totalCashAmount = _.sumBy(this.getAllBillings, 'paidAmount')
    this.totalBillValue = _.sumBy(this.getAllBillings, 'paidAmount');
    console.log('getAllBillings', this.getAllBillings);
  }
  onChangeCategory(event: any) {
    if (this.selectedCategory == 1) {
      this.salesList = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
    }
    if (this.selectedCategory == 2) {
      this.salesList = [{ name: "S.no" }, { name: "Service Name" }, { name: "Qty Sold" }, { name: "Consumed Products" }, { name: "Net Total" }, { name: "Tax Total" }, { name: "Gross Total" }];
    }
    if (this.selectedCategory == 3) {
      this.salesList = [{ name: "S.no" }, { name: "Date" }, { name: "Product Id" }, { name: "Product Name" }, { name: "Quantity" }, { name: "Total Amount" }, { name: "Purchased By" }, { name: "Action" }];
    }
    if (this.selectedCategory == 4) {
      this.staffSalesByService = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Service Amount" }, { name: "Discount Amount" }, { name: "Commission / Tip" }, { name: "Duration (Minutes)" }, { name: "Total Amount" }, { name: "Action" }];
      this.staffSalesByProduct = [{ name: "S.no" }, { name: "Staff Name" }, { name: "Product Amount" }, { name: "Discount Amount" }, { name: "Commission" }, { name: "Total Amount" }, { name: "Action" }];
    }
  }

  onChangeDate(event: any) {
    debugger


    // console.log('datetype', this.selectedDate);
    // console.log('newdate', new Date());
    // console.log('form', new Date().toISOString);
    // var a = moment.utc(new Date()).tz("Asia/Taipei");
    // a.format()
    // console.log('final', a.utc().format());
    // let toDaydate = JSON.stringify(moment(new Date()).format('YYYY-MM-DDTHH:MM:SSZ'));
    let toDaydate = moment(new Date()).format('YYYY-MM-DD');
    console.log('todaydate', toDaydate);
    let newM = moment(toDaydate, "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).local();
    console.log('newM', newM);
    if (this.selectedDate && !this.selectedGender) {
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
    } else if (this.selectedDate && this.selectedGender) {
      if (this.selectedDate == 1) {
        this.getAllBillings = this.getBillings.filter(x => x.created_at == toDaydate && x.gender == this.selectedGender);
        console.log('gett', this.getAllBillings);
      }
      if (this.selectedDate == 2) {
        let yesterDay = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
        console.log('yesterDay', yesterDay);
        this.getAllBillings = this.getBillings.filter(x => x.created_at == yesterDay && x.gender == this.selectedGender);
        console.log('gett', this.getAllBillings);
      }
      if (this.selectedDate == 4) {
        let currentMonth = new Date().getMonth() + 1;
        console.log('currentMonth', currentMonth);
        this.getAllBillings = this.getBillings.filter(x => (new Date(x.created_at).getMonth() + 1 == currentMonth) && this.selectedGender);
        // console.log('gett', this.getAllBillings);
      }
      if (this.selectedDate == 5) {
        var startDate: any;
        var endDate: any;
        if (this.startDate) {
          startDate = moment(this.startDate).format('YYYY-MM-DD');
          this.getAllBillings = this.getBillings.filter(x => x.created_at >= startDate);
        }
        if (this.endDate) {
          endDate = moment(this.endDate).format('YYYY-MM-DD');
          this.getAllBillings = this.getBillings.filter(x => x.created_at <= endDate);

        }
        this.showCustomeDate = true;
      }

    } else if (this.selectedGender && !this.selectedDate) {
      let genderList = [];
      genderList = this.getBillings.filter(x => x.gender == this.selectedGender);
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
