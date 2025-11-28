import { Component } from '@angular/core';
import { IonicModule, AlertController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';

import { AuthService } from '../../services/auth';
import { FileService } from '../../services/file';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  private _alertOption = {
    header: 'No se pudo iniciar la sesión',
    message: '',
    buttons: ['OK']
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private fileService: FileService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {
    if (this.platform.is('hybrid')) {
      this.fileService.createFolder('policies');
      this.fileService.createFolder('checkbooks');
    }
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const raw = this.loginForm.value || {};
    const username: string = String(raw.username ?? '').trim();
    const password: string = String(raw.password ?? '').trim();

    if (!username || !password) {
      // formulario inválido, ya marcamos campos; opcional: mostrar alerta
      return;
    }

    this.authService.login(username, password).subscribe({
      next: async (result) => {
        if (!result.error) {
          await this.navCtrl.navigateRoot('/home');
        } else {
          const alert = await this.alertCtrl.create({
            header: 'No se pudo iniciar la sesión',
            message: result.message || 'Credenciales inválidas',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'No se pudo iniciar la sesión',
          message: err?.message ?? 'Error de conexión',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}