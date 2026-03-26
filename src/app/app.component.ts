import { Component } from '@angular/core';
import { Platform, AlertController, ModalController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { Badge } from '@awesome-cordova-plugins/badge/ngx';

import { PushNotifications } from '@capacitor/push-notifications';

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
      await this.initPushNotification();
      this.fileService.initPaths();
      this.splashScreen.hide();
    }

    const isLogged = await this.authService.isLoged();
    await this.router.navigateByUrl(isLogged ? '/home' : '/login', { replaceUrl: true });
  }

  private async initPushNotification() {

    console.log('Init push Capacitor...');

    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      console.log('Permiso de push denegado');
      return;
    }

    await PushNotifications.register();

    // ✅ TOKEN (ANTES: registration)
    PushNotifications.addListener('registration', (token) => {
      console.log('✅ TOKEN:', token.value);

      const device = {
        token: token.value,
        platform: this.getDevicePlatform()
      };

      this.userRepository.setDevice(device);
    });

    // ❌ ERROR
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ PUSH ERROR:', error);
    });

    // 📩 NOTIFICACIÓN EN FOREGROUND
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📩 FOREGROUND:', notification);

      const data: any = notification.data;

      this.apiService.cantNews++;
      this.apiService.newNotification.emit(this.apiService.cantNews);

      this.badge.increase(1).catch(() => {});
      this.onConfirmNotification(data);
    });

    // 👆 CLICK EN NOTIFICACIÓN (BACKGROUND / APP CERRADA)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('👆 CLICK:', notification);

      const data: any = notification.notification.data;

      // Esperar a que la navegación inicial termine antes de mostrar el modal
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        take(1)
      ).subscribe(() => {
        this.showNewsModal(data?.newsId);
      });
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