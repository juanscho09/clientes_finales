import { Component } from '@angular/core';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
//import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Browser } from '@capacitor/browser';

import { SendMessageComponent } from './modal/send-message/send-message.component';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  constructor(
    private modalCtrl: ModalController,
    private platform: Platform,
    private callNumber: CallNumber,
    private emailComposer: EmailComposer
  ) {}

  async onCall(phone: string) {
    try {
      await this.callNumber.callNumber(String(phone), false);
    } catch {
      // fallback: open tel: link
      window.open(`tel:${phone}`, '_self');
    }
  }

  onEmail(email: string) {
    if (this.platform.is('hybrid')) {
      this.emailComposer.open({
        to: email,
        isHtml: false
      }).catch(e => console.warn('Email composer error', e));
    } else {
      window.location.href = `mailto:${email}`;
    }
  }

  async onWeb(url: string) {
    try {
      await Browser.open({ url });
    } catch {
      window.open(url, '_blank');
    }
  }

  async openMessageModal() {
    const modal = await this.modalCtrl.create({
      component: SendMessageComponent,
      breakpoints: [0, 0.5, 1],
      initialBreakpoint: 0.6
    });
    await modal.present();
  }
}