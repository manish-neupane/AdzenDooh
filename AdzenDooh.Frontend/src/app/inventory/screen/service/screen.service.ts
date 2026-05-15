import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { MvScreen, MvUpsertScreen, MvDeleteScreen, MvScreenFilter, MvScreenDdl, MvScreenDetailParam, MvScreenDetail } from '../model/screen.model';
import { ApiResponse, GridResponse, ParamOption } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {

  private base = `${environment.apiUrl}/Screen`;

  constructor(private api: ApiService) {}

  getAll(param: ParamOption<MvScreenFilter>): Observable<ApiResponse<GridResponse<MvScreen>>> {
    return this.api.get(`${this.base}/GetAll`, param);
  }
  
  getDetail(param: MvScreenDetailParam): Observable<ApiResponse<MvScreenDetail>> {
  return this.api.get(`${this.base}/GetDetail`,  param);
}
  save(payload: MvUpsertScreen): Observable<ApiResponse<MvScreen[]>> {
    return this.api.post(`${this.base}/Save`, payload);
  }

  getDdl(param: MvScreenDdl): Observable<ApiResponse<MvScreen[]>> {
    return this.api.post(`${this.base}/GetDdl`, param);
  }

  delete(payload: MvDeleteScreen): Observable<ApiResponse<MvScreen>> {
    return this.api.delete(`${this.base}/Delete`, payload);
  }
}