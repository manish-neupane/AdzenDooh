import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { MvScreen, MvUpsertScreen, MvDeleteScreen, MvScreenFilter } from '../model/screen.model';
import { ApiResponse, GridResponse, ParamOption } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {

  private base = `${environment.apiUrl}/Screen`;

  constructor(private api: ApiService) {}

  getGrid(param: ParamOption<MvScreenFilter>): Observable<ApiResponse<GridResponse<MvScreen>>> {
    return this.api.get(`${this.base}/GetAll`, param);
  }

  saveScreen(payload: MvUpsertScreen): Observable<ApiResponse<MvScreen[]>> {
    return this.api.post(`${this.base}/SaveScreen`, payload);
  }

  deleteScreen(payload: MvDeleteScreen): Observable<ApiResponse<MvScreen>> {
    return this.api.delete(`${this.base}/DeleteScreen`, payload);
  }
}