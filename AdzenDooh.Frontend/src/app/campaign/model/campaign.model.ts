// Filters
export interface MvCampaignFilter {
  searchText?: string;
}

// Nested / Joined Models
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

// Reference Types (for POST bodies)
export interface MvCampaignScreenRef {
  screenId: number;
}

export interface MvCampaignDateRef {
  startDate: string;
  endDate:   string;
}

// POST Bodies
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

// GET Responses
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

// Lookup / Dropdown Models
export interface MvScreenOption {
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

// Form Value Shapes (component-only)
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

// Assign-Creative UI State
export interface MvScreenSlot {
  screenId:   number;
  screenName: string;
  playDate:   Date | null;
  creatives:  MvCreativeRow[];
}

export interface MvCreativeRow {
  creativeId:   number;
  creativeName: string;
  thumbnailUrl: string;
  fileType:     'image' | 'video';
  playSequence: number;
}

export interface MvCreativeGroupedByScreen {
  screenName: string;
  creatives:  MvCampaignCreative[];
}