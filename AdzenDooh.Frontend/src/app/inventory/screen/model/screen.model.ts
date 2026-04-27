// screen.model.ts
export interface mvScreen {
  screenName: any;
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
export interface mvScreenFilter {
  status?: string;
  orientation?: string;
  searchText?: string;
}

// DTO for create/update
export interface mvUpsertScreen {
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
export interface mvDeleteScreen {
  id: number;
  deletedBy: number;
}
