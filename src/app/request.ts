import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(public http: HttpClient) {
    RequestUtil.init(http);
  }
}

export class RequestUtil {
  private static http: HttpClient;

  static init(http: HttpClient) {
    this.http = http;
  }

  static get<T>(url: string, params?: any) {
    if (!this.http) throw new Error('RequestUtil not initialized');
    return firstValueFrom(this.http.get<T>(url, { params }));
  }

  static getText(url: string, params?: any) {
    if (!this.http) throw new Error('RequestUtil not initialized');
    return firstValueFrom(this.http.get(url, { params, responseType: 'text' }));
  }

  static post<T>(url: string, body: any, options?: any, isJson: boolean = true) {
    if (!this.http) throw new Error('RequestUtil not initialized');
    return firstValueFrom(this.http.post<T>(url, body, options));
  }
}
