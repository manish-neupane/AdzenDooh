import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { ApiResponse } from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';
import {
  MvScreenOperatingHour,
  MvScreenOperatingHourFilter,
  MvAddScreenOperatingHour,
  MvDeleteScreenOperatingHour
} from '../model/operating-hour.model';

@Injectable({
  providedIn: 'root',
})
export class ScreenOperatingHourService {

  private base = `${environment.apiUrl}/ScreenOperatingHour`;

  constructor(private api: ApiService) {}

  getOperatingHours(param: MvScreenOperatingHourFilter): Observable<ApiResponse<MvScreenOperatingHour[]>> {
    return this.api.get(`${this.base}/GetAll`, param);
  }

  createOperatingHours(payload: MvAddScreenOperatingHour[]): Observable<ApiResponse<MvScreenOperatingHour[]>> {
    return this.api.post(`${this.base}/Add`, payload);
  }

  deleteOperatingHour(payload: MvDeleteScreenOperatingHour): Observable<ApiResponse<null>> {
    return this.api.delete(`${this.base}/Delete`, payload);
  }
}