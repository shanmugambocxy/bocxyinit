import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MerchantNotifications } from './notifications.model';
import { AnimationController, IonCard, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { ToastService } from '../_services/toast.service';
import { merchantNotificationService } from './notfications.service';
import { NavigationHandler } from '../_services/navigation-handler.service';
import { take } from 'rxjs/operators';
import { SharedService } from '../_services/shared.service';
import { Animation } from '@ionic/angular';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notficationList: MerchantNotifications[];
  page: number;
  totalNotficationsCount: number;
  totalPages: number;
  @Input() value: any;
  audioUrl = "../../assets/audio/audio1.wav";
  private animation: Animation;
  @ViewChild(IonCard, { read: ElementRef }) card: ElementRef<HTMLIonCardElement>;

  constructor(
    private location: Location,
    private Cservice: merchantNotificationService,
    public menuCtrl: MenuController,
    public navCtrl: NavController,
    private nav: NavigationHandler,
    private toast: ToastService,
    private sharedService: SharedService,
    private loadingctrl: LoadingController,
    public modalController: ModalController,
    private animationCtrl: AnimationController

  ) { }

  async ngOnInit() {
    this.page = 1;
    await this.getNotifications(this.page);
    await this.getNotificationsCount();
  }
  ngAfterViewInit() {
    // this.animation = this.animationCtrl
    //   .create()
    //   .addElement(this.card.nativeElement)
    //   .duration(1500)
    //   .iterations(Infinity)
    //   .fromTo('transform', 'translateX(0px)', 'translateX(100px)')
    //   .fromTo('opacity', '1', '0.2');
  }

  ionViewWillEnter() {
    let audio = new Audio();
    audio.load();
    // audio.muted = true;
    // audio.pause();
    if (this.value) {
      this.playAudio();

    }
  }

  playAudio() {
    // this.audio = new Audio();
    // this.audio.src = "../../assets/audio/audio1.wav";
    // this.audio.load();
    // this.audio.play();

    let audio = new Audio();
    console.log('audio', audio.paused);
    // audio.currentTime = 0;
    // audio.pause();
    // audio.muted = true;
    audio.src = "../../assets/audio/audio1.wav"
    audio.load();
    audio.play();
    debugger
    // let audio = new Audio("../../assets/audio/audio1.wav");
    // console.log('audio', audio.paused);
    // audio.load();
    // audio.play();
    // audio.src = "../../assets/audio/audio1.wav"
    // audio.load();
    // var audioPlay = audio.play();
    // audio.currentTime = 0;
    // audio.pause();


    // if (audio && !audio.paused) {
    //   // audio.pause();
    //   // audio.currentTime = 0; // Rewind track to beginning (is you need this)
    //   // audio.src = this.audioUrl;
    //   audio.src = "../../assets/audio/audio1.wav"
    //   audio.load();
    //   audio.play();


    //   debugger
    //   // if (audio) {
    //   //   setTimeout(() => {
    //   //     audio.play();

    //   //   }, 1000);

    //   // }
    // }


  }
  dismiss() {
    this.modalController.dismiss();
    let audio = new Audio();
    audio.load();
  }
  getNotificationsCount() {
    // const loading = this.loadingctrl.create();
    // loading.then((l) => l.present());
    return new Promise((resolve, reject) => {
      this.Cservice
        .getNotficationsCount()
        .pipe(take(1))
        .subscribe(
          (response) => {
            // loading.then((l) => l.dismiss());
            if (response && response.status === 'SUCCESS') {
              this.totalNotficationsCount = response.data.count;
            } else {
              this.toast.showToast('Something went wrong. Please try again');
            }
            resolve(1);
          },
          (error) => {
            this.toast.showToast('Something went wrong. Please try again');
            reject(error);
          }
        );
    });
  }
  getNotifications(page: number) {
    // const loading = this.loadingctrl.create();
    // loading.then((l) => l.present());
    return new Promise((resolve, reject) => {
      this.Cservice
        .getNotfications(page)
        .pipe(take(1))
        .subscribe(
          (response) => {
            // loading.then((l) => l.dismiss());
            if (response && response.status === 'SUCCESS') {
              if (this.value) {
                this.notficationList = response.data.filter(x => x.read == 'N');
                // const intervalId = setInterval(this.ngOnInit, 60 * 1000);
                // const intervalId = setInterval(this.ngOnInit, 60 * 500);
                // setInterval(this.ngOnInit, 1000);
                // this.playAudio();
                // setInterval(() => {
                //   // if (this.timeLeft > 0) {
                //   //   this.timeLeft--;
                //   // } else {
                //   //   this.pauseTimer();
                //   //   this.resendOtpEnable = true;
                //   // }
                //   // this.getNotifications(1);
                //   console.log(' notify  data');

                // }, 60 * 500);



              } else {
                this.notficationList = response.data;
              }
              this.totalPages = response.totalPages;
            } else {
              this.toast.showToast('Something went wrong. Please try again');
            }
            resolve(1);
          },
          (error) => {
            this.toast.showToast('Something went wrong. Please try again');
            reject(error);
          }
        );
    });
  }
  previous() {
    this.nav.GoBackTo('/home/tabs/tab1');
  }
  loadMoreData(infiniteScroll) {
    this.page = this.page + 1;
    this.getNotifications(this.page)
      .catch(error => { infiniteScroll.target.complete(); });
  }
  doRefresh(refresher) {
    this.getNotificationsCount();
    this.getNotifications(this.page);
    refresher.target.complete();
  }
  gotToAppointment(id, read, appId) {
    if (read === 'N') {
      this.updateNotificationsServices(id);
    }
    this.dismiss();
    this.navCtrl.navigateRoot('/detailappointment/' + appId);
    // this.toast.showToast("Under Development");
  }
  updateNotificationsServices(id: number) {
    return new Promise((resolve, reject) => {
      this.Cservice
        .updateNotficationsFlag(id)
        .pipe(take(1))
        .subscribe(
          (response) => {
            resolve(1);
          },
          (error) => {
            this.toast.showToast('Failed to make the notification read');
            reject(error);
          }
        );
    });

  }
}
