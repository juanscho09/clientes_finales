// ...existing code...
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError, finalize } from 'rxjs/operators';

import { BaseService } from './base';
import { ApiService } from './api';
import { HelperService } from './helper';
import { LoaderService } from './loader';
import { PolicyService } from './policy';

import { MechanicalAssistance } from './../models/mechanicalAssistance.model';
import { Policy } from './../models/policy.model';

@Injectable({ providedIn: 'root' })
export class MechanicalAssistanceService extends BaseService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private policyService: PolicyService,
    private helperService: HelperService,
    private loaderService: LoaderService
  ) {
    super();
  }

  /**
   * Devuelve un Observable que emite siempre MechanicalAssistance[].
   * No mezcla ServerResponse con el array (evita el error de tipos).
   */
  getContacts(): Observable<MechanicalAssistance[]> {
    // show loader (it's async but we don't await here)
    this.loaderService.show();
    return this.apiService.getPolicies().pipe(
      map(res => (res.data ?? []) as Policy[]),
      switchMap((policies: Policy[]) => {
        const uniqueCompanies = this.policyService.getUniquieCompanies(policies || []);
        return this.getCompanyContactsJSON().pipe(
          map((contacts: MechanicalAssistance[]) => {
            return contacts.filter(c =>
              uniqueCompanies.some(company =>
                this.helperService.stringSanitize(c.databaseCompany ?? '') === this.helperService.stringSanitize(company ?? '')
              )
            );
          })
        );
      }),
      catchError(err => throwError(() => err)),
      finalize(() => { this.loaderService.hide(); })
    );
  }

  private getCompanyContactsJSON(): Observable<MechanicalAssistance[]> {
    return this.http.get<any>('./assets/json/data/companyContacts.json').pipe(
      map(data => MechanicalAssistance.createCollection(data ?? [])),
      catchError(err => throwError(() => err))
    );
  }
}
// ...existing code...