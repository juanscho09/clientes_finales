// ...existing code...
import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './news.component.html'
})
export class NewsComponent {
  @Input() news!: News;

  constructor(private modalCtrl: ModalController) {}

  onClose() {
    this.modalCtrl.dismiss();
  }
}