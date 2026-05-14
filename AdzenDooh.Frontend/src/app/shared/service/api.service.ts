import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { stringify } from "qs";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params: any): Observable<T> {
    // 'allowDots' handles the filter.status=active part automatically
    const queryString = stringify(params, { allowDots: true, skipNulls: true });
    return this.http.get<T>(`${url}?${queryString}`);
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
