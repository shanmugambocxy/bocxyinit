import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ReceiptPage } from '../receipt/receipt.page';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.page.html',
  styleUrls: ['./payment-status.page.scss'],
})
export class PaymentStatusPage implements OnInit {
  bankRefNo!: any;
  order_no!: any;
  message!: any;
  order_amt: any;
  getPaymentDetails: any;
  orderDate: any;
  cardName: any;
  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public modalController: ModalController,
    private navCtrl: NavController,) { }

  ngOnInit() {

    this.paymentinit();

  }


  paymentinit() {
    this.route.queryParams.subscribe(params => {
      console.log('params', params);

      this.order_no = params['id'];
      this.bankRefNo = params['ref'];
      // this.order_no = 'b3e9eede-fe82-4a57-a356-4bccaf5390cc';
      // this.bankRefNo = 312010579432;



      console.log(this.order_no);
      console.log(this.bankRefNo);
      this.checkStatus();
    });
  }

  checkStatus() {
    const data = {
      reference_no: this.bankRefNo,
      order_no: this.order_no
    }
    this.http.post('http://localhost:3001/api/checkStatus', data, { responseType: 'json' }).subscribe(
      (response: any) => {
        console.log(response);
        this.getPaymentDetails = response;
        console.log("order_status", response.order_status);
        if (this.getPaymentDetails.order_status === 'Shipped') {
          this.message = 'Payment Successful!';
          this.bankRefNo = response.reference_no;
          this.order_no = response.order_no;
          this.order_amt = response.order_amt;
          this.orderDate = response.order_status_date_time;
          this.cardName = response.order_card_name;
        } else {
          this.message = 'Payment failed!';
          this.bankRefNo = response.reference_no;
          this.order_no = response.order_no;
          this.order_amt = response.order_amt;
          this.orderDate = response.order_status_date_time;
          this.cardName = response.order_card_name;
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  async ViewReceipt() {
    const modal = await this.modalController.create({
      component: ReceiptPage,
      componentProps: {
        modalId: 0,
        // modalTitle: 'Location Search'
      }
    });

    modal.onDidDismiss().then((dataReturned) => {

    });

    return await modal.present();
  }
  goToHome() {
    this.navCtrl.navigateRoot('/home');
  }
}
