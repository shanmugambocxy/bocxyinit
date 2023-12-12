import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custompopup',
  templateUrl: './custompopup.page.html',
  styleUrls: ['./custompopup.page.scss'],
})
export class CustompopupPage implements OnInit {
  reasonList: any = [{ id: 1, name: 'Apologies, service extended' }, { id: 2, name: 'Stylist unavailable, kindly rebook later slot' }, { id: 3, name: 'products required for service is currently unavailable' }];
  otherReason: boolean = false;
  customreason: any;
  @Input() value: any;
  constructor(public modalCtrl: ModalController,) { }

  ngOnInit() {
    console.log('value', this.value);

  }

  onChangeCancel(event: any) {
    debugger
    // if (event.detail.value == 'other reason') {
    //   this.otherReason = true;
    // } else {
    //   this.otherReason = false;

    // }
  }
  chooseReason(reason: any) {
    this.customreason = reason.name;
  }
  submitReason() {
    debugger
    this.modalCtrl.dismiss(this.customreason)
  }
  dismiss() {
    this.modalCtrl.dismiss();
  }

}
