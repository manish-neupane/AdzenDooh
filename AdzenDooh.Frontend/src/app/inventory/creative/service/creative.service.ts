import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../shared/service/api.service';
import { MvCreative, MvDeleteCreative, MvCreativeFilter, MvCreativeUpload } from '../model/creative.model';
import { ApiResponse, GridResponse, ParamOption} from '../../../shared/model/sharedModel';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreativeService {

  private base = `${environment.apiUrl}/Creative`;

  constructor(private api: ApiService) {}


  getGrid(filter: ParamOption<MvCreativeFilter>): Observable<ApiResponse<GridResponse<MvCreative>>> {
    return this.api.get<ApiResponse<GridResponse<MvCreative>>>(`${this.base}/GetAll`, filter);
  }

  upload(file: File, payload: MvCreativeUpload): Observable<ApiResponse<MvCreative[]>> {
    const form = new FormData();
    form.append('file',      file);
    form.append('tenantId',  payload.tenantId.toString());
    form.append('name',      payload.name);
    form.append('createdBy', payload.createdBy.toString());

    return this.api.post<ApiResponse<MvCreative[]>>(`${this.base}/Upload`, form);
  }
 
  deleteCreative(payload: MvDeleteCreative): Observable<ApiResponse<MvCreative>> {
    return this.api.delete<ApiResponse<MvCreative>>(`${this.base}/DeleteCreative`, payload);
  }

}