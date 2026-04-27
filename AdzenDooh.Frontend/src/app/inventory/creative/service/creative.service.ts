import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { mvCreative, mvAddCreative, mvDeleteCreative, mvCreativeFilter } from '../model/creative.model';
import { ApiResponse, GridResponse } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreativeService {

  private base = `${environment.apiUrl}/Creative`;

  constructor(private api: ApiService) {}


  creativeGrid(filter: mvCreativeFilter = {}): Observable<ApiResponse<GridResponse<mvCreative>>> {
    return this.api.get<ApiResponse<GridResponse<mvCreative>>>(`${this.base}/CreativeGrid`, filter);
  }

 
  addCreative(payload: mvAddCreative): Observable<ApiResponse<mvCreative[]>> {
    return this.api.post<ApiResponse<mvCreative[]>>(`${this.base}/PostCreative`, payload);
  }

 
  deleteCreative(payload: mvDeleteCreative): Observable<ApiResponse<mvCreative>> {
    return this.api.delete<ApiResponse<mvCreative>>(`${this.base}/DeleteCreative`, payload);
  }

}