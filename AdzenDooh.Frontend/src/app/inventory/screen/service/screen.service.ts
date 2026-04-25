import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { mvScreen, mvUpsertScreen, mvDeleteScreen,mvScreenFilter } from '../model/screenModel';
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
  getScreens(filter: mvScreenFilter = {}): Observable<ApiResponse<mvScreen[]>> {
    return this.http.get<ApiResponse<mvScreen[]>>(`${this.base}/ScreenGrid`, {
      params: new HttpParams({ fromObject: { ...filter } }),
    });
  }

  // POST /Screen/PostScreen
  upsertScreen(payload: mvUpsertScreen): Observable<ApiResponse<mvScreen[]>> {
    return this.http.post<ApiResponse<mvScreen[]>>(`${this.base}/PostScreen`, payload);
  }

  // PUT /Screen/PutScreen
  // updateScreen(payload: UpdateScreen): Observable<ApiResponse<mvScreen[]>> {
  //   return this.http.put<ApiResponse<mvScreen[]>>(`${this.base}/PutScreen`, payload);
  // }

  // DELETE /Screen/DeleteScreen
  deleteScreen(payload: mvDeleteScreen): Observable<ApiResponse<mvScreen>> {
    return this.http.delete<ApiResponse<mvScreen>>(`${this.base}/DeleteScreen`, {
      body: payload,
    });
  }

}