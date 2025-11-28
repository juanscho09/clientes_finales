// ...existing code...
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';

import { ENV } from '../app/environment';
import { Policy } from '../models/policy.model';
import { ServerResponse } from '../models/serve-response.model';
import { User } from '../models/user.model';
import { News } from '../models/news.model';
import { BaseService } from './base';
import { AuthService } from './auth';
import { LoaderService } from './loader';

@Injectable({ providedIn: 'root' })
export class ApiService extends BaseService {
  cantNews = 0;
  firstTime = true;
  newNotification = new EventEmitter<number>();

  constructor(
    private http: HttpClient,
    private ENV: ENV,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {
    super();
  }

  getPolicies(): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/getPolizas`;
        return this.http.post<any>(url, { user: user.username, password: user.password }).pipe(
          map(response => new ServerResponse(false, 'Policies ok', '', Policy.createCollection(response?.data ?? []))),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  getPoliciesBySection(section: string): Observable<Policy[]> {
    return this.getPolicies().pipe(
      map((res: ServerResponse) => ((res.data ?? []) as Policy[]).filter(p => (p.section || '').toLowerCase() === (section || '').toLowerCase()))
    );
  }

  getPoliciesByVariousRisks(): Observable<Policy[]> {
    return this.getPolicies().pipe(
      map((res: ServerResponse) => ((res.data ?? []) as Policy[]).filter(p => (p.section || '').toLowerCase() !== Policy.CAR))
    );
  }

  download(source: string, filename: string): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/descarga`;
        const body = {
          user: user.username,
          password: user.password,
          rutaDocumento: source,
          nroArchivo: filename,
          target: 'ionic'
        };
        // backend returns base64/text
        return this.http.post(url, body, { responseType: 'text' }).pipe(
          map((text: string) => new ServerResponse(false, 'OK', '', text)),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  saveSinisterRisksSeveral(sinister: FormData): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/guardar-riesgos-varios?user=${user.username}&password=${user.password}`;
        return this.http.post<any>(url, sinister).pipe(
          map(response => {
            if (!response?.error) {
              return new ServerResponse(false, '', 'Siniestro guardado con exito.', null);
            }
            return new ServerResponse(true, 'No se pudo guardar el siniestro', response?.message ?? 'Hubo un fallo en el servidor', null);
          }),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  saveSinisterAutomobile(sinister: FormData): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/guardar-automotores?user=${user.username}&password=${user.password}`;
        return this.http.post<any>(url, sinister).pipe(
          map(response => {
            if (!response?.error) {
              return new ServerResponse(false, '', 'Siniestro guardado con exito.', null);
            }
            return new ServerResponse(true, 'No se pudo guardar el siniestro', response?.message ?? 'Hubo un fallo en el servidor', null);
          }),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  getNewsById(id: number): Observable<ServerResponse> {
    this.loaderService.show();
    return this.http.get<any>(`${this.ENV.getApiUrl()}/getNewsById/${id}`).pipe(
      map(response => {
        if (!response?.error) {
          const news = News.create(response.data);
          return new ServerResponse(false, response.title, response.message, news);
        }
        return new ServerResponse(true, response.title, response.message, null);
      }),
      catchError(err => this.handleError(err)),
      finalize(() => this.loaderService.hide())
    );
  }

  getNewsByUserId(): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/getNewsByUserId/${user.id}?user=${user.username}&password=${user.password}`;
        return this.http.get<any>(url).pipe(
          map(response => {
            if (!response?.error) {
              const news = News.createCollection(response.data);
              return new ServerResponse(false, response.title, response.message, news);
            }
            return new ServerResponse(true, response.title, response.message, []);
          }),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  getNewsNotRead(home = false): Observable<number> {
    if (!this.firstTime && !home) {
      return of(this.cantNews);
    }
    this.firstTime = false;
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/quant-news-not-read/${user.id}?user=${user.username}&password=${user.password}`;
        return this.http.get<any>(url).pipe(
          map(response => {
            this.cantNews = !response?.error ? response.data : 0;
            this.newNotification.emit(this.cantNews);
            return this.cantNews;
          }),
          catchError(err => { throw this.handleError(err); }),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  readNews(newsId: number): Observable<ServerResponse> {
    return from(this.authService.getUser()).pipe(
      switchMap((user: User | null) => {
        if (!user) return throwError(() => new ServerResponse(true, 'No user', 'Usuario no logueado', null));
        const url = `${this.ENV.getApiUrl()}/readNew/${newsId}/${user.id}?user=${user.username}&password=${user.password}`;
        return this.http.get<any>(url).pipe(
          map(response => {
            if (!response?.error) {
              this.cantNews = Math.max(0, this.cantNews - 1);
              this.newNotification.emit(this.cantNews);
              return new ServerResponse(false, response.title, response.message, response.data);
            }
            return new ServerResponse(true, response.title, response.message, null);
          }),
          catchError(err => this.handleError(err))
        );
      })
    );
  }

  readNewsInApp(): void {
    if (this.cantNews > 0) this.cantNews--;
  }
}
// ...existing code...