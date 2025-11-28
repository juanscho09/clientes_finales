import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
//import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  cantNewsNotRead = 0;
  newNotificationSubscription?: Subscription;

  constructor(
    private navCtrl: NavController,
    private callNumber: CallNumber,
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.currentUser = this.authService.currentUser ?? null;
  }

  ngOnInit() {
    this.newNotificationSubscription = this.apiService.newNotification.subscribe((cant: number) => {
      this.cantNewsNotRead = cant;
    });
    this.refreshNoReadNotifications();
  }

  ngOnDestroy() {
    this.newNotificationSubscription?.unsubscribe();
  }

  refreshNoReadNotifications() {
    this.apiService.getNewsNotRead(true).subscribe({
      next: (res) => this.cantNewsNotRead = res,
      error: (err) => console.log(err)
    });
  }

  onLoad(page: string) {
    switch (page) {
      case 'myPoliciesPage':
        this.navCtrl.navigateForward('/my-policies');
        break;
      case 'mechanicalAssistancePage':
        this.navCtrl.navigateForward('/mechanical-assistance');
        break;
      case 'sinisterPage':
        this.navCtrl.navigateForward('/sinister');
        break;
      case 'contactPage':
        this.navCtrl.navigateForward('/contact');
        break;
      case 'notificationPage':
        this.navCtrl.navigateForward('/notifications');
        break;
      case 'callUs':
        this.onCall('1144833866');
        break;
    }
  }

  onCall(phone: string) {
    this.callNumber.callNumber(phone, false)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }
}