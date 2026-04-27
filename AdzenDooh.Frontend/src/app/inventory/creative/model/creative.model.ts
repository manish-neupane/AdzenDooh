export interface mvCreative {
    id: number;
    tenantId: number;
    name: string;
    url: string;
    isVideo: boolean;
    extension: string;
    resolution: string;
    orientation: string;
    durationSecond?: number | null;
    createdAt: string;
    createdBy: number;
    isDeleted: boolean;
    deletedAt?: string | null;
    deletedBy?: number | null;
}

export interface mvAddCreative {
  tenantId: number;
  name: string;
  url: string;
  isVideo: boolean;
  extension: string;
  resolution: string;
  orientation: string;
  durationSecond?: number | null;
  createdBy: number;
} 

export interface mvDeleteCreative {
  id: number;
  tenantId: number;
  deletedBy: number;
}
export interface mvCreativeFilter {
  isVideo?: boolean;
  orientation?: string;
  searchText?: string;
}