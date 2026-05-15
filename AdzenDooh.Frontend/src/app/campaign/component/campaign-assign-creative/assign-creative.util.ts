// campaign/component/assign-media/assign-media.util.ts

import {
  MvCampaignDate,
  MvCampaignScreen,
  MvCreative,
} from '../../model/campaign.model';
import {
  MvCreativeRow,
  MvScreenSlot,
} from '../../model/campaign.model';
import { MvCreativeDdl } from '../../../cms/creative/model/creative.model';

// Date helpers
export function formatDateIso(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function deriveMinDate(dates: MvCampaignDate[]): Date | null {
  if (!dates?.length) return null;
  return new Date(Math.min(...dates.map(d => new Date(d.startDate).getTime())));
}

export function deriveMaxDate(dates: MvCampaignDate[]): Date | null {
  if (!dates?.length) return null;
  return new Date(Math.max(...dates.map(d => new Date(d.endDate).getTime())));
}

// File type helpers
export function getFileIcon(fileType: string): string {
  return fileType === 'video' ? 'pi pi-video'
       : fileType === 'html'  ? 'pi pi-code'
       : 'pi pi-image';
}

// Sequence helpers
export function renumberSequences(rows: MvCreativeRow[]): void {
  rows.forEach((row, i) => (row.playSequence = i + 1));
}

// Mapping helpers
export function toScreenSlot(screen: MvCampaignScreen): MvScreenSlot {
  return {
    screenId:   screen.screenId,
    screenName: screen.screenName,
    playDate:   null,
    creatives:  [],
  };
}