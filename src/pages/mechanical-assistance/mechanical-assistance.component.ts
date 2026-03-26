import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
//import { CallNumber } from '@ionic-native/call-number/ngx'; // no es para la version actual
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

import { AuthService } from '../../services/auth';
import { MechanicalAssistanceService } from '../../services/mechanical-assistance';
import { MechanicalAssistance } from '../../models/mechanicalAssistance.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-mechanical-assistance',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './mechanical-assistance.component.html',
  styleUrls: ['./mechanical-assistance.component.scss']
})
export class MechanicalAssistanceComponent implements OnInit, OnDestroy {
  mechanicalAssistanceSubscription?: Subscription;
  mechanicalAssistanceContacts: MechanicalAssistance[] = [];
  flagHasNoContact = false;

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService,
    private mechanicalAssistanceService: MechanicalAssistanceService,
    private callNumber: CallNumber
  ) {}

  async ngOnInit() {
    try {
      const user: User | null = await this.authService.getUser();
      // migrated service now does its own user handling; still safe to call without user
      this.mechanicalAssistanceSubscription = this.mechanicalAssistanceService.getContacts().subscribe({
        next: (contacts) => {
          this.mechanicalAssistanceContacts = contacts ?? [];
          this.flagHasNoContact = !contacts || contacts.length === 0;
        },
        error: () => this.showAlert('CAM', 'Hubo un fallo en el servidor')
      });
    } catch {
      this.showAlert('CAM', 'Usuario no logueado');
    }
  }

  ngOnDestroy(): void {
    this.mechanicalAssistanceSubscription?.unsubscribe();
  }

  async onCall(phone: string) {
    try {
      await this.callNumber.callNumber(phone, false);
    } catch {
      // no throw, solo loguear
      console.warn('Call error');
    }
  }

  onOpenWhatsApp(phone: string) {
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      this.showAlert('CAM', 'No hay un número válido para WhatsApp');
      return;
    }

    const url = `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
  }

  async showAlert(title: string, message: string, buttons: any[] = ['OK']) {
    const alert = await this.alertCtrl.create({ header: title, message, buttons });
    await alert.present();
  }
}