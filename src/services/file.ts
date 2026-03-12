// ...existing code...
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { FileOpener } from '@capacitor-community/file-opener';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileService {
  public POLICYPATH = 'files/policies';
  public CHECKBOOKPATH = 'files/checkbooks';
  private baseDirectory = Directory.Data;
  public enableWebFilesystem = true;

  constructor(private platform: Platform) {}

  private toUint8ArrayFromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async createFolder(folderName: string): Promise<void> {
    if (!this.platform.is('hybrid') && !this.enableWebFilesystem) return;
    try {
      await Filesystem.mkdir({ path: folderName, directory: this.baseDirectory, recursive: true });
    } catch (e: any) {
      // ignore exists
    }
  }

  download(path: string, fileName: string, base64: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const cleanBase64: string = (base64 || '').startsWith('data:') ? (base64 as string).split(',')[1] : (base64 || '');
      if (this.platform.is('hybrid') || this.enableWebFilesystem) {
        const target = `${path}/${fileName}`.replace(/^\/+/, '');
        Filesystem.writeFile({ path: target, data: cleanBase64, directory: this.baseDirectory, encoding: Encoding.UTF8 })
          .then(() => { observer.next(true); observer.complete(); })
          .catch(err => observer.error(err));
      } else {
        try {
          const byteArray = this.toUint8ArrayFromBase64(cleanBase64);
          const buffer = byteArray.buffer as ArrayBuffer;
          const blob = new Blob([buffer], { type: 'application/pdf' });
          const url = (window.URL || (window as any).webkitURL).createObjectURL(blob) as string;
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          (window.URL || (window as any).webkitURL).revokeObjectURL(url as string);
          observer.next(true);
          observer.complete();
        } catch (e) {
          observer.error(e);
        }
      }
    });
  }

  openFile(path: string, filename: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (!this.platform.is('hybrid') && !this.enableWebFilesystem) { observer.next(false); observer.complete(); return; }
      const target = `${path}/${filename}`.replace(/^\/+/, '');

      if (this.platform.is('hybrid')) {
        Filesystem.getUri({ path: target, directory: this.baseDirectory })
          .then(result => FileOpener.open({ filePath: result.uri, contentType: 'application/pdf' }))
          .then(() => { observer.next(true); observer.complete(); })
          .catch(err => observer.error(err));
        return;
      }

      Filesystem.readFile({ path: target, directory: this.baseDirectory }).then(result => {
        const base64 = result.data as string;
        try {
          const byteArray = this.toUint8ArrayFromBase64(base64);
          const buffer = byteArray.buffer as ArrayBuffer;
          const blob = new Blob([buffer], { type: 'application/pdf' });
          const url = (window.URL || (window as any).webkitURL).createObjectURL(blob) as string;
          Browser.open({ url }).then(() => {
            observer.next(true);
            observer.complete();
          }).catch(() => {
            try { window.open(url); observer.next(true); observer.complete(); } catch (e) { observer.error(e); }
          });
        } catch (e) { observer.error(e); }
      }).catch(err => observer.error(err));
    });
  }

  async removeFile(path: string, fileName: string): Promise<boolean> {
    if (!this.platform.is('hybrid') && !this.enableWebFilesystem) return false;
    const target = `${path}/${fileName}`.replace(/^\/+/, '');
    try { await Filesystem.deleteFile({ path: target, directory: this.baseDirectory }); return true; }
    catch { return false; }
  }

  async checkFile(path: string, fileName: string): Promise<boolean> {
    if (!this.platform.is('hybrid') && !this.enableWebFilesystem) return false;
    const cleanPath = path.replace(/^\/+/, '');
    const target = `${cleanPath}/${fileName}`.replace(/^\/+/, '');
    try {
      await Filesystem.stat({ path: target, directory: this.baseDirectory });
      return true;
    } catch (e) {
      // Debug: listar contenido de la carpeta para ver qué existe en web
      try {
        const listing = await Filesystem.readdir({ path: cleanPath, directory: this.baseDirectory });
        console.warn('[FileService.checkFile] stat failed for', target, 'listing:', listing);
      } catch (err) {
        console.warn('[FileService.checkFile] readdir failed for', cleanPath, err);
      }
      return false;
    }
  }

  async removeFolder(folderName: string): Promise<void> {
    if (!this.platform.is('hybrid') && !this.enableWebFilesystem) return;
    try { await Filesystem.rmdir({ path: folderName, directory: this.baseDirectory, recursive: true }); } catch {}
  }
}
// ...existing code...