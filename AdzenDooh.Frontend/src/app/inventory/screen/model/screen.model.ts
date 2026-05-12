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