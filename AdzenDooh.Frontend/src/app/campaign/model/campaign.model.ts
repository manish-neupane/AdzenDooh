//  Filters 

export interface MvCampaignFilter {
  search?: string;
}

//  Nested Objects (joined from DB) 

export interface MvCampaignScreen {
  id:         number;
  campaignId: number;
  screenId:   number;
  screenName: string;
  location:   string;
}

export interface MvCampaignDate {
  id:         number;
  campaignId: number;
  startDate:  string;
  endDate:    string;
}

export interface MvCampaignCreative {
  id:           number;
  campaignId:   number;
  screenId:     number;
  creativeId:   number;
  playDate:     string;
  playSequence: number;
  creativeName: string;
  creativeUrl:  string;
  isVideo:      boolean;
}



export interface MvCampaignScreenRef {
  screenId: number;
}

export interface MvCampaignDateRef {
  startDate: string;
  endDate:   string;
}

//  (POST bodies) 

export interface MvCreateCampaign {
  tenantId:       number;
  createdBy:      number;
  name:           string;
  remarks:        string;
  status:         number;
  durationInDays: number;
  screens:        MvCampaignScreenRef[];
  dates:          MvCampaignDateRef[];
}

export interface MvSaveCampaignCreative {
  campaignId: number;
  createdBy:  number;
  screens:    MvCreativeScreen[];
}

export interface MvCreativeScreen {
  screenId:  number;
  playDate:  string;
  creatives: MvCreativeItem[];
}

export interface MvCreativeItem {
  creativeId:   number;
  playSequence: number;
}

//  (GET responses) 

// Lightweight — for the grid list
export interface MvCampaign {
  id:             number;
  tenantId:       number;
  name:           string;
  remarks:        string;
  status:         number;
  durationInDays: number;
  createdBy:      number;
  screens:        MvCampaignScreen[];
  dates:          MvCampaignDate[];
}

// Full detail — for the campaign detail/overview 
export interface MvCampaignDetail {
  id:             number;
  tenantId:       number;
  name:           string;
  remarks:        string;
  status:         number;
  durationInDays: number;
  createdBy:      number;
  screens:        MvCampaignScreen[];
  dates:          MvCampaignDate[];
  creatives:      MvCampaignCreative[];
}

//  Lookup Models (dropdown / checkbox data) 

export interface MvScreen {
  id:       number;
  name:     string;
  location: string;
}

export interface MvCreative {
  id:             number;
  name:           string;
  url:            string;
  isVideo:        boolean;
  durationSecond: number | null;
  orientation:    string;
}

//  Form Value Shapes (component-only)

export interface CampaignFormValue {
  name:             string;
  remarks:          string;
  status:           number;
  screenSelections: boolean[];
  dates:            DateRowValue[];
}

export interface DateRowValue {
  startDate: Date | null;
  endDate:   Date | null;
}

export interface MvCampaignDetail{

  campaignId: number;
  tenantId : number ;
}


// campaign/model/assign-media.model.ts
 
// ── Creative DDL (dropdown) ──────────────────────────────────────────
export interface MvCreativeDdl {
  id: number;
  name: string;
  thumbnailUrl: string;
  fileType: 'image' | 'video' | 'html';
}
 
// ── In-memory per-screen UI state ────────────────────────────────────
export interface MvScreenSlot {
  screenId:   number;
  screenName: string;
  playDate:   Date | null;  // per-screen PlayDate, validated against campaign range
  creatives:  MvCreativeRow[];
}
 
export interface MvCreativeRow {
  creativeId:   number;
  creativeName: string;
  thumbnailUrl: string;
  fileType:     string;
  playSequence: number;
}