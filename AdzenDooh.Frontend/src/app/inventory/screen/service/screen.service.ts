import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { mvScreen, mvUpsertScreen, mvDeleteScreen, mvScreenFilter } from '../model/screen.model';
import { ApiResponse, GridResponse } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {

  private base = `${environment.apiUrl}/Screen`;

  constructor(private api: ApiService) {}

  screenGrid(filter: mvScreenFilter = {}): Observable<ApiResponse<GridResponse<mvScreen>>> {
    return this.api.get<ApiResponse<GridResponse<mvScreen>>>(`${this.base}/ScreenGrid`, filter);
  }

  upsertScreen(payload: mvUpsertScreen): Observable<ApiResponse<mvScreen[]>> {
    return this.api.post<ApiResponse<mvScreen[]>>(`${this.base}/PostScreen`, payload);
  }

  deleteScreen(payload: mvDeleteScreen): Observable<ApiResponse<mvScreen>> {
    return this.api.delete<ApiResponse<mvScreen>>(`${this.base}/DeleteScreen`, payload);
  }

}