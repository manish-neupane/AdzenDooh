import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../app/shared/service/api.service';
import { ApiResponse, GridResponse, ParamOption } from '../../../app/shared/model/sharedModel';
import {  MvCampaign, MvCreateCampaign, MvCampaignFilter, MvCampaignDetail, MvSaveCampaignCreative } from '../model/campaign.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CampaignService {

  private base = `${environment.apiUrl}/Campaign`;

  constructor(private api: ApiService) {}


  getCampaigns(param: ParamOption<MvCampaignFilter>): Observable<ApiResponse<GridResponse<MvCampaign>>> {
    return this.api.get(`${this.base}/GetAll`, param);
  }

  createCampaign(payload: MvCreateCampaign): Observable<ApiResponse<MvCampaign>> {
    return this.api.post(`${this.base}/AddCampaign`, payload);
  }

 getCampaignDetails(campaignId: number): Observable<ApiResponse<MvCampaignDetail>> {
  return this.api.get(`${this.base}/GetCampaignDetail`, { CampaignId: campaignId, TenantId: 1 });
}

createCampaignCreative(payload: MvSaveCampaignCreative): Observable<ApiResponse<void>> {
  return this.api.post(`${this.base}/addCampaignCreative`, payload);
  
    
}}