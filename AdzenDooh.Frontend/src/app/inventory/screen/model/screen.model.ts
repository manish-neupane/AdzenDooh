// screen.model.ts
export interface MvScreen {
  id: number;
  tenantId: number;
  name: string;
  macAddress: string;
  location: string;
  address: string;
  status: string;
  resolution: string;
  orientation: string;
  createdAt: Date;
  createdBy: number;
  updatedAt?: Date;
  updatedBy?: number;
}

// Filter model
export interface MvScreenFilter {
  status?: string;
  orientation?: string;
  searchText?: string;
}

// DTO for create/update
export interface MvUpsertScreen {
  id?: number;
  tenantId: number;
  name: string;
  macAddress: string;
  location: string;
  address?: string;
  status: string;
  resolution?: string;
  orientation: string;
  createdBy?: number;
  updatedBy?: number;
}

// DTO for delete
export interface MvDeleteScreen {
  id: number;
  deletedBy: number;
}
export interface MvScreenDdl
{
      TenantId : number;  
    CampaignId? : number; 
}


  // screen Detail Models

  export interface MvScreenDetail {
  id: number;
  name: string;
  location: string;
  address?: string | null;
  status: string;
  resolution?: string | null;
  orientation: string;
  macAddress: string;
  createdAt: string;

  campaigns: MvScreenDetailCampaign[];
  operatingHours: MvScreenDetailOperatingHour[];
}
export interface MvScreenDetailCampaign {
  id: number;
  name: string;
  status: number;
  durationInDays: number;
  remarks?: string | null;
  createdAt: string;
  startDate?: string | null;
  endDate?: string | null;
}
export interface MvScreenDetailOperatingHour {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  averageAudienceCount?: number | null;
}

export interface MvScreenDetailParam {
  screenId: number;
  tenantId: number;
}