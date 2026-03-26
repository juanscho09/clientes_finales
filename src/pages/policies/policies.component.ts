// ...existing code...
import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Policy } from '../../models/policy.model';
import { PolicyService } from '../../services/policy';
//import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent implements OnInit {
  policies: Policy[] = [];
  readonly CAR = Policy.CAR;
  readonly VARIOUSRISKS = Policy.VARIOUSRISKS;

  constructor(private navCtrl: NavController,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private callNumber: CallNumber,
              private policyService: PolicyService) {}

  ngOnInit() {
    const state = history.state as any;
    this.policies = Array.isArray(state?.policies) ? state.policies as Policy[] : [];
  }

  async onDownload(policy: Policy) {
    this.policyService.policyDownload(policy).subscribe({
      next: (ok) => {
        this.showToast(ok ? `Póliza ${policy.name} descargada.` : `Póliza ${policy.name} ya está descargada.`);
        this.toGoPoliciesDownloadedOfSection(policy.section);
      },
      error: (err) => this.showToast('¡Ha ocurrido un error!')
    });
  }

  async onOpenPolicy(policy: Policy) {
    this.policyService.openPolicy((policy.name || '') + '.pdf').subscribe({
      next: (ok) => {
        if (!ok) {
          this.policyService.policyDownload(policy).subscribe(() => {
            this.policyService.openPolicy((policy.name || '') + '.pdf').subscribe();
          }, () => this.showToast('¡Ha ocurrido un error!'));
        }
      }, error: () => this.showToast('¡Ha ocurrido un error!')
    });
  }

  async onOpenCheckbook(policy: Policy) {
    this.policyService.openCheckbook((policy.checkbookName || '') + '.pdf').subscribe({
      next: (ok) => {
        if (!ok) {
          this.policyService.checkbookDownload(policy).subscribe(() => {
            this.policyService.openCheckbook((policy.checkbookName || '') + '.pdf').subscribe();
          }, () => this.showToast('¡Ha ocurrido un error!'));
        }
      }, error: () => this.showToast('¡Ha ocurrido un error!')
    });
  }

  onSinister(policy: Policy) {
    // navigate to sinister and pass policy
    this.navCtrl.navigateForward('/sinister', { state: { policy } });
  }

  onCall(phone: string | null) {
    this.callNumber.callNumber(String(phone), false).catch(() => console.log('Error launching dialer'));
  }

  async onRemovePolicy(policy: Policy, position: number) {
    const alert = await this.alertCtrl.create({
      header: 'Notificación',
      message: `¿Deseas eliminar la poliza ${policy.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar', handler: async () => {
            try {
              await this.policyService.removeByPolicy('downloaded', policy).toPromise();
              this.policies.splice(position, 1);
              this.showToast('Póliza eliminada');
            } catch (e) {
              this.showToast('¡Ha ocurrido un error!');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private toGoPoliciesDownloadedOfSection(sectionName: string | null) {
    this.policyService.getWithSections('downloaded').subscribe({
      next: (sections) => {
        const found = sections.find(x => x.name === sectionName);
        if (found) this.policies = found.policies ?? [];
      }, error: (e) => console.error(e)
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom' });
    await toast.present();
  }
}