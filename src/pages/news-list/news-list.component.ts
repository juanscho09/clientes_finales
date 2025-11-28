// ...existing code...
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api';
import { ServerResponse } from '../../models/serve-response.model';
import { News } from '../../models/news.model';
import { NewsComponent } from '../news/news.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [IonicModule, CommonModule, NewsComponent],
  templateUrl: './news-list.component.html'
})
export class NewsListComponent implements OnInit {
  news: News[] = [];
  showNews = true;

  constructor(private modalCtrl: ModalController,
              private apiService: ApiService,
              private toastCtrl: ToastController) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.apiService.getNewsByUserId().subscribe({
      next: (response: ServerResponse) => {
        const data = response.data ?? [];
        this.news = Array.isArray(data) ? data : [];
        this.showNews = this.news.length > 0;
      },
      error: (err) => {
        this.showToast('¡Ha ocurrido un error!');
        console.error(err);
      }
    });
  }

  async onShowNewsModal(item: News) {
    if (!item) return;
    if (!item.readAt) {
      item.readAt = new Date();
      this.apiService.readNews(item.id).subscribe(); // best-effort
      this.apiService.readNewsInApp();
    }

    const modal = await this.modalCtrl.create({
      component: NewsComponent,
      componentProps: { news: item }
    });
    await modal.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message, duration: 3000, position: 'bottom'
    });
    await toast.present();
  }
}