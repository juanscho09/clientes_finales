// ...existing code...
import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({ providedIn: 'root' })
export class HelperService {
  constructor() {}

  removeAccent(str = ''): string {
    return str.normalize ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : str;
  }

  stringSanitize(str = ''): string {
    return this.removeAccent(String(str).toLowerCase().trim());
  }

  b64EncodeUnicode(str: string): string {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    ));
  }

  cleanBase64(data: string | null): string {
    if (!data) return '';
    return data.startsWith('data:') ? data.split(',')[1] : data;
  }

  async openExternal(url: string): Promise<void> {
    if (!url) return;
    try { await Browser.open({ url }); } catch { window.open(url, '_blank'); }
  }
}