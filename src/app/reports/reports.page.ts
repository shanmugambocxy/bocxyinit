import { Component, OnInit } from '@angular/core';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as _ from 'lodash';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  selectedCategory: any;
  selectedDate: any;
  selectedGender: any;
  catagoryList: any = [{ name: "Service List" }, { name: "Service Sales" }, { name: "Product Sales" }];
  dateTypeList: any = [{ id: 1, name: "Today" }, { id: 2, name: "YesterDay" }, { id: 3, name: "7 days" }, { id: 4, name: "Current Month" }, { id: 5, name: "Custom Range" }];
  genterTypeList: any = [{ name: "Male" }, { name: "Female" }, { name: "Others" }];
  labelList: any = [{ name: "S.no" }, { name: "Order ID" }, { name: "Date" }, { name: "Customer Name" }, { name: "Payment Mode" }, { name: "Amount" }, { name: "Action" }];
  labelValueList: any = [{ name: "8877566" }, { name: "12/12/2023" }, { name: "Shan" }, { name: "Cash" }, { name: "5000" }]
  getBillings: any = [];
  showCustomeDate: boolean = false;
  constructor(private appointmentListService: AppointmentListService,
    private loadingCtrl: LoadingController,
    private router: Router) { }

  ngOnInit() {
    // this.getAllBillings();
    this.getBillingByStoreId();

  }

  getAllBillings() {
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
        this.getBillings = res.data;
        let totalCashAmount = _.sumBy(this.getBillings, 'paidAmount')
        console.log('totalCashAmount', totalCashAmount);
      }
    })
  }
  onChangeCategory(event: any) {

  }

  onChangeDate(event: any) {
    console.log('datetype', this.selectedDate);
    if (this.selectedDate == 5) {
      this.showCustomeDate = true;
    }
    let date = new Date();
    let getByDate = this.getBillings.filter(x => x.dueDate == date)
    console.log('getdate', getByDate);

  }
  startChange() {

  }
  onChangeGender(event: any) {

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
