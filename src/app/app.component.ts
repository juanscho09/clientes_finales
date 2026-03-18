import { Component } from '@angular/core';
import { Platform, AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { Push, PushObject, PushOptions } from '@awesome-cordova-plugins/push/ngx';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';

import { AuthService } from '../services/auth';
import { FileService } from '../services/file';
import { ApiService } from '../services/api';
import { UserRepository } from '../repositories/user.repository';
import { NewsComponent } from '../pages/news/news.component';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private push: Push,
    private apiService: ApiService,
    private authService: AuthService,
    private fileService: FileService,
    private userRepository: UserRepository,
    private badge: Badge,
    private router: Router
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    await this.platform.ready();
    this.statusBar.styleDefault();

    if (this.platform.is('hybrid')) {
      this.initPushNotification();
      this.fileService.initPaths();
      this.splashScreen.hide();
    }

    const isLogged = await this.authService.isLoged();
    await this.router.navigateByUrl(isLogged ? '/home' : '/login', { replaceUrl: true });
  }

  private initPushNotification() {
    const options: PushOptions = {
      android: { senderID: '661117763569', icon: 'cam' },
      ios: { alert: 'true', badge: 'true', sound: 'true' }
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log('✅ REGISTRATION OK:', data);
      const device = {
        token: data.registrationId,
        platform: this.getDevicePlatform()
      };
      this.userRepository.setDevice(device);
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('📩 NOTIFICATION:', data);
      this.apiService.cantNews = this.apiService.cantNews + 1;
      this.apiService.newNotification.emit(this.apiService.cantNews);

      if (data?.additionalData?.foreground) {
        this.badge.increase(1).catch(() => {});
        this.onConfirmNotification(data.additionalData);
      } else {
        this.showNewsModal(data?.additionalData?.newsId);
      }
    });

    pushObject.on('error').subscribe((error: any) => {
      console.error('Error with Push plugin', error);
    });
  }

  private async onConfirmNotification(data: any) {
    const isBirthday = Number(data?.isBirthdayMsg) === 1;
    const header = isBirthday ? '¡Feliz Cumpleaños!' : (data?.newsName || 'Noticia');
    const message = isBirthday ? 'Cam te desea un feliz cumpleaños.' : '¡Tienes una nueva noticia!';

    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Ignorar', role: 'cancel' },
        { text: 'Ver', handler: () => this.showNewsModal(data?.newsId) }
      ]
    });

    await alert.present();
  }

  private async showNewsModal(newsId: number) {
    this.apiService.readNews(newsId).subscribe();

    this.apiService.getNewsById(newsId).subscribe({
      next: async (response: any) => {
        if (!response?.errors) {
          const modal = await this.modalCtrl.create({
            component: NewsComponent,
            componentProps: { news: response.data }
          });
          await modal.present();
        } else {
          this.showAlert('CAM', 'Hubo un fallo en el servidor');
        }
      },
      error: () => this.showAlert('CAM', 'Hubo un fallo en el servidor')
    });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private getDevicePlatform(): 'ANDROID' | 'IOS' | 'WINDOWS' | 'WEB' {
    if (this.platform.is('android')) return 'ANDROID';
    if (this.platform.is('ios')) return 'IOS';
    if (this.platform.is('desktop')) return 'WINDOWS';
    return 'WEB';
  }
}
