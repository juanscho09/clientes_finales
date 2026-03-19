// ...existing code...
import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

import { Policy } from './../models/policy.model';
import { ServerResponse } from '../models/serve-response.model';
import { ApiService } from './api';
import { FileService } from './file';
import { Section } from '../models/section.model';
import { PolicyRepository } from '../repositories/policy.repository';
import { HelperService } from './helper';
import { LoaderService } from './loader';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  policiesDownloadedChanged = new EventTarget();

  constructor(
    private apiService: ApiService,
    private policyRepository: PolicyRepository,
    private fileService: FileService,
    private loaderService: LoaderService,
    private helper: HelperService
  ) {}

  storePolicies(): Observable<boolean> {
    this.loaderService.show();
    return this.apiService.getPolicies().pipe(
      switchMap((response: ServerResponse) => {
        if (!response.error && response.data) {
          return from(this.policyRepository.saveCollection('online', response.data)).pipe(
            map(() => true),
            catchError(ex => { throw ex; })
          );
        }
        return of(false);
      }),
      catchError(() => throwError(() => 'Error storing policies')),
      // finalize loader hide handled by caller patterns in api or could be done here as well
    );
  }

  /*download(path: string, fileName: string, endpoint: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      from(this.fileService.checkFile(path, fileName + '.pdf')).subscribe(() => {
        observer.next(false); observer.complete();
      }, () => {
        this.apiService.download(endpoint, fileName).subscribe((response: ServerResponse) => {
          const base64 = this.helper.cleanBase64(response.data);
          this.fileService.download(path, fileName + '.pdf', base64).subscribe(() => {
            observer.next(true); observer.complete();
          }, err => observer.error(err));
        }, err => observer.error(err));
      });
    });
  }*/
  download(path: string, fileName: string, endpoint: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      from(this.fileService.checkFile(path, fileName + '.pdf'))
        .pipe(
          catchError(() => of(null)) // archivo no existe → seguir con descarga
        )
        .subscribe({
          next: (exists) => {
            if (exists !== false) {
              // archivo ya existe → no descargar
              observer.next(false);
              observer.complete();
              return;
            }

            // archivo NO existe → descargar
            this.apiService.download(endpoint, fileName).subscribe({
              next: (response: ServerResponse) => {
                const base64 = String(response.data ?? '');
                this.fileService.download(path, fileName + '.pdf', base64).subscribe({
                  next: () => {
                    observer.next(true);
                    observer.complete();
                  },
                  error: (err) => observer.error(err)
                });
              },
              error: (err) => observer.error(err)
            });
          },
          error: (err) => observer.error(err)
        });
    });
  }

  policyDownload(policy: Policy): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.loaderService.show('Descargando');
      this.download(this.fileService.POLICYPATH, policy.name || 'policy', policy.endpoint || '').subscribe(async (ok) => {
        if (!ok) { this.loaderService.hide(); observer.next(false); observer.complete(); return; }
        try {
          await this.policyRepository.save('downloaded', policy);
          this.loaderService.hide();
          observer.next(true); observer.complete();
        } catch (ex) {
          this.loaderService.hide();
          observer.error(ex);
        }
      }, error => { this.loaderService.hide(); observer.error(error); });
    });
  }

  checkbookDownload(policy: Policy): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.loaderService.show();
      this.download(this.fileService.CHECKBOOKPATH, policy.checkbookName || 'checkbook', policy.checkbookEndpoint || '').subscribe((ok) => {
        this.loaderService.hide(); observer.next(ok); observer.complete();
      }, error => { this.loaderService.hide(); observer.error(error); });
    });
  }

  openPolicy(fileName: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.fileService.openFile(this.fileService.POLICYPATH, fileName).subscribe({
        next: (ok: boolean) => {
          observer.next(ok);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  openCheckbook(fileName: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.fileService.openFile(this.fileService.CHECKBOOKPATH, fileName).subscribe({
        next: (ok: boolean) => {
          observer.next(ok);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  getWithSections(status: string): Observable<Section[]> {
    return from(this.policyRepository.get(status)).pipe(
      map((policies: Policy[] | null) => Section.createCollection(policies ?? [])),
      catchError(() => throwError(() => 'Error get policies'))
    );
  }

  removeByPolicy(status: string, policy: Policy): Observable<boolean> {
    this.loaderService.show();
    return from(this.policyRepository.removeByPolicy(status, policy)).pipe(
      switchMap(() => from(Promise.all([
        this.fileService.removeFile(this.fileService.POLICYPATH, (policy.name || '') + '.pdf'),
        this.fileService.removeFile(this.fileService.CHECKBOOKPATH, (policy.checkbookName || '') + '.pdf')
      ]))),
      map(([r1, r2]) => {
        this.loaderService.hide();
        this.policiesDownloadedChanged.dispatchEvent(new Event('changed'));
        return true;
      }),
      catchError(err => { this.loaderService.hide(); throw err; })
    );
  }

  getUniquieCompanies(policies: Policy[]): string[] {
    const allCompanies = (policies || []).map(x => x.company ?? '');
    return allCompanies.filter((item, pos) => allCompanies.indexOf(item) === pos);
  }
}