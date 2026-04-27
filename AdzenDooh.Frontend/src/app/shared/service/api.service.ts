import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<T>(url, {
      params: new HttpParams({ fromObject: { ...params } }),
    });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

  delete<T>(url: string, body?: any): Observable<T> {
    return this.http.delete<T>(url, { body });
  }

}