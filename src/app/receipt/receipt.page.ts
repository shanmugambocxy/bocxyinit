import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DetailAppointmentService } from '../detailappointment/detailappointment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
})
export class ReceiptPage implements OnInit {
  @ViewChild('pdfTable', { static: false }) pdfTable: ElementRef;
  productList: any = [];
  serviceList: any = [];
  receiptLabel: any = [{ name: "ITEM" }, { name: "PRICE" }, { name: "QTY" }, { name: "DISCOUNT" }, { name: "TAX" }, { name: "TOTAL" },]
  receiptValue: any = [{ name: "Anti Hairfall Treatment(Member)" }, { name: "₹1000.00" }, { name: "1" }, { name: "₹0.00" }, { name: "₹ 180.00" }, { name: "₹ 1,180.00" },]

  paymentLabel: any = [{ name: "PAYMENT MODE" }, { name: "AMOUNT" }, { name: "DATE" }, { name: "STATUS" }]
  paymentValue: any = [{ name: "Cash" }, { name: "₹ 1180.00" }, { name: "04 Nov 2023 10.06 AM" }, { name: "Success" }];
  id: any;
  receiptDetails: any;
  customerName: any;
  constructor(public modalController: ModalController,
    private httpService: DetailAppointmentService,
    private route: ActivatedRoute,
    private navCtrl: NavController,) { }

  ngOnInit() {
    debugger
    let id = this.route.snapshot.paramMap.get("billid");
    let type = this.route.snapshot.paramMap.get("type");
    if (id) {
      // this.id = JSON.parse(id);
      this.id = id;

      this.getRecieptData();
    }
  }

  ionViewWillEnter() {

  }
  // public downloadAsPDF() {
  //   const doc = new jsPDF();

  //   const specialElementHandlers = {
  //     '#editor': function (element, renderer) {
  //       return true;
  //     }
  //   };

  //   const pdfTable = this.pdfTable.nativeElement;

  //   doc.fromHTML(pdfTable.innerHTML, 15, 15, {
  //     width: 190,
  //     'elementHandlers': specialElementHandlers
  //   });

  //   doc.save('tableToPdf.pdf');
  // }
  getRecieptData() {
    this.receiptDetails = {};
    this.httpService.getReportsDetails(this.id).subscribe(res => {

      if (res.data.length > 0) {
        this.receiptDetails = res.data[0];
        this.customerName = res.data[0].customer_name;
        if (res.data[0].products && res.data[0].products.length > 0) {
          this.productList = res.data[0].products;

        } else {
          this.productList = [];
        }
      }
    })
  }

  generatePDF(divRef) {
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

  saveAsPDF() {
    // html2canvas(document.querySelector('#divRef'), { height: 1800, width: window.innerWidth * 2, scale: 1 }).then(canvas => {
    //   const dataURL = canvas.toDataURL();
    //   const pdf = new jsPDF();
    //   pdf.addImage(dataURL, 'JPEG', 0, 0);
    //   pdf.save('Sample Charts.pdf');
    // });
  }
  dismiss() {
    // this.modalController.dismiss();
    this.navCtrl.navigateRoot('/home');

  }
}
