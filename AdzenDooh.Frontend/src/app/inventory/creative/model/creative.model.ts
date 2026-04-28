export interface MvCreative {
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

export interface MvAddCreative {
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

export interface MvDeleteCreative {
  id: number;
  tenantId: number;
  deletedBy: number;
}
export interface MvCreativeFilter {
  isVideo?: boolean;
  orientation?: string;
  searchText?: string;
}
export interface MvCreativeUpload {
  tenantId:  number;
  name:      string;
  createdBy: number;
}