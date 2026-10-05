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

  // 显式声明返回类型：HttpClient.post 的重载在 options 为 any 时会推断成
  // Observable<HttpEvent<any>>，导致调用方拿不到响应体类型。
  static post<T = any>(url: string, body: any, options?: any, isJson: boolean = true): Promise<T> {
    if (!this.http) throw new Error('RequestUtil not initialized');
    // If caller expects a non-JSON/text response (e.g. plain string),
    // set responseType to 'text' so HttpClient returns a string.
    if (isJson) {
      return firstValueFrom(this.http.post<T>(url, body, options)) as Promise<T>;
    } else {
      const opts = Object.assign({}, options, { responseType: 'text' as 'json' });
      return firstValueFrom(this.http.post<any>(url, body, opts)) as unknown as Promise<T>;
    }
  }
}
