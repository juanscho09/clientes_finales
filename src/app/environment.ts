import { Injectable } from "@angular/core";

@Injectable()
export class ENV {
  static readonly DEBUG: boolean = false;
  static readonly API_URL_PROD = "https://seguros.centroatencionmoron.com/api";
  static readonly API_URL_DEV = 'http://192.168.0.59:88/cam-clientes-finales/public/api';
  static readonly HTTP_RETRIES: 0;

  public getApiUrl() {
    if (ENV.DEBUG) {
      return ENV.API_URL_DEV;
    }
    return ENV.API_URL_PROD
  }
}
