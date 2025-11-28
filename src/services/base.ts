// ...existing code...
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { ServerResponse } from '../models/serve-response.model';

export class BaseService {
  constructor() {}

  protected handleError(error: HttpErrorResponse | any): Observable<ServerResponse> {
    console.error(error);
    const errRes = new ServerResponse(true, 'Ooops!', 'Hubo un fallo en el servidor', null);

    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 401:
        case 404:
        case 500:
          // optional handling
          break;
        default:
          errRes.message = error.message || JSON.stringify(error);
      }
      // try to include server body message if present
      if (error.error && typeof error.error === 'object') {
        errRes.title = error.error.title ?? errRes.title;
        errRes.message = error.error.message ?? errRes.message;
      }
    } else {
      errRes.message = error?.message ?? String(error);
    }

    return throwError(() => errRes);
  }
}