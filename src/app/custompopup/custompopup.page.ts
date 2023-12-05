import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custompopup',
  templateUrl: './custompopup.page.html',
  styleUrls: ['./custompopup.page.scss'],
})
export class CustompopupPage implements OnInit {
  reasonList: any = [{ id: 1, name: 'customer not present at a time of appointment' }, { id: 2, name: 'other reason' }];
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
