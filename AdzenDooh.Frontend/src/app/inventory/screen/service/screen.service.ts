import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { mvScreen, PostScreen, UpdateScreen, DeleteScreen,ScreenSearchFilter } from '../model/screenModel';
import { ApiResponse } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ScreenService {

  private base = `${environment.apiUrl}/Screen`;

  constructor(private http: HttpClient) {}

  // ─── Endpoints ───────────────────────────────────────────────────────────────

  // GET /Screen/GetScreenList
  getScreens(filter: ScreenSearchFilter = {}): Observable<ApiResponse<mvScreen[]>> {
    return this.http.get<ApiResponse<mvScreen[]>>(`${this.base}/GetScreenList`, {
      params: new HttpParams({ fromObject: { ...filter } }),
    });
  }

  // POST /Screen/PostScreen
  addScreen(payload: PostScreen): Observable<ApiResponse<mvScreen[]>> {
    return this.http.post<ApiResponse<mvScreen[]>>(`${this.base}/PostScreen`, payload);
  }

  // PUT /Screen/PutScreen
  updateScreen(payload: UpdateScreen): Observable<ApiResponse<mvScreen[]>> {
    return this.http.put<ApiResponse<mvScreen[]>>(`${this.base}/PutScreen`, payload);
  }

  // DELETE /Screen/DeleteScreen
  deleteScreen(payload: DeleteScreen): Observable<ApiResponse<mvScreen>> {
    return this.http.delete<ApiResponse<mvScreen>>(`${this.base}/DeleteScreen`, {
      body: payload,
    });
  }

}