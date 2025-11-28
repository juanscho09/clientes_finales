import { Component } from '@angular/core';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './send-message.component.html'
})
export class SendMessageComponent {
  emailContent = '';

  constructor(
    private modalCtrl: ModalController,
    private platform: Platform,
    private emailComposer: EmailComposer,
    private authService: AuthService
  ) {}

  onClose() {
    this.modalCtrl.dismiss();
  }

  async sendMessage() {
    const body = this.createBody();
    const to = 'info@centroatencionmoron.com';
    if (this.platform.is('hybrid')) {
      this.emailComposer.open({ to, subject: 'Consulta APP', body, isHtml: true })
        .catch(e => console.warn('Email composer', e));
      this.onClose();
    } else {
      // fallback via mailto
      const mailto = `mailto:${to}?subject=${encodeURIComponent('Consulta APP')}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      this.onClose();
    }
  }

  createBody(): string {
    const currentUser = this.authService.currentUser;
    const name = currentUser?.name ?? 'Usuario';
    return `<p><strong>Nombre:</strong> ${name}<br><br>Consulta: ${this.emailContent}</p>`;
  }
}