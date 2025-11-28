// ...existing code...
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';

import { ENV } from '../app/environment';
import { ServerResponse } from '../models/serve-response.model';
import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { PolicyRepository } from './../repositories/policy.repository';
import { BaseService } from './base';
import { FileService } from './file';
import { LoaderService } from './loader';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  currentUser: User | null = null;
  constructor(
    private http: HttpClient,
    private ENV: ENV,
    private userRepository: UserRepository,
    private policyRepository: PolicyRepository,
    private loaderService: LoaderService,
    private fileService: FileService
  ) { super(); }

  login(username: string, password: string): Observable<ServerResponse> {
    return from(this.userRepository.getDevice()).pipe(
      switchMap(device => {
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/login`;
        return this.http.post<any>(url, { user: username, password, platform: device?.platform, deviceToken: device?.token }).pipe(
          map(response => {
            if (!response.error) {
              const user = User.create(response.data);
              this.currentUser = user;
              // persist user but don't block observable (convert promise to observable)
              this.userRepository.save(user).catch(() => {});
              return new ServerResponse(false, 'Login ok', '', user);
            }
            return new ServerResponse(true, '', response.mensaje || 'Login failed', null);
          }),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  logout(): Observable<ServerResponse> {
    return from(this.userRepository.getDevice()).pipe(
      switchMap(device => {
        this.loaderService.show();
        const url = `${this.ENV.getApiUrl()}/logout`;
        return this.http.post<any>(url, { userId: this.currentUser?.id, platform: device?.platform }).pipe(
          switchMap(response => from(Promise.all([
            this.userRepository.remove(),
            this.policyRepository.remove('online'),
            this.policyRepository.remove('downloaded'),
            this.fileService.removeFolder(this.fileService.POLICYPATH),
            this.fileService.removeFolder(this.fileService.CHECKBOOKPATH)
          ]))),
          map(() => new ServerResponse(false, 'Logout OK', '', null)),
          catchError(err => this.handleError(err)),
          finalize(() => this.loaderService.hide())
        );
      })
    );
  }

  getUser(): Promise<User | null> {
    return this.userRepository.get();
  }

  async isLoged(): Promise<boolean> {
    const user = await this.userRepository.get();
    if (user) { this.currentUser = user; return true; }
    return false;
  }
}