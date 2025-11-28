// ...existing code...
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private spinner: HTMLIonLoadingElement | null = null;

  constructor(private loadingCtrl: LoadingController) {}

  async show(message: string = 'Cargando'): Promise<void> {
    try {
      if (this.spinner) {
        try { (this.spinner as any).message = message; } catch {}
        return;
      }
      this.spinner = await this.loadingCtrl.create({ message });
      await this.spinner.present();
    } catch (e) {
      console.warn('LoaderService.show error', e);
      this.spinner = null;
    }
  }

  async hide(): Promise<void> {
    if (!this.spinner) return;
    try { await this.spinner.dismiss(); } catch {}
    finally { this.spinner = null; }
  }
}
// ...existing code...