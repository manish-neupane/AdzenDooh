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
// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Converts a Date object to "YYYY-MM-DD" string.
 * Used when building the MvSaveCampaignCreative payload (MvCreativeScreen.playDate).
 */
export function formatDateIso(date: Date): string {
  return date.toISOString().split('T')[0];
}


//   Derives the earliest startDate across all MvCampaignDate records.
 
export function deriveMinDate(dates: MvCampaignDate[]): Date | null {
  if (!dates?.length) return null;
  return new Date(Math.min(...dates.map(d => new Date(d.startDate).getTime())));
}


//  Derives the latest endDate across all MvCampaignDate records.
 
export function deriveMaxDate(dates: MvCampaignDate[]): Date | null {
  if (!dates?.length) return null;
  return new Date(Math.max(...dates.map(d => new Date(d.endDate).getTime())));
}

// ── File type helpers ─────────────────────────────────────────────────────────

/**
 * Maps a creative fileType string to its PrimeNG icon class.
 * Used in both the playlist table and the Add Media dropdown item template.
 */
export function getFileIcon(fileType: string): string {
  return fileType === 'video' ? 'pi pi-video'
       : fileType === 'html'  ? 'pi pi-code'
       : 'pi pi-image';
}

// ── Sequence helpers ──────────────────────────────────────────────────────────

/**
 * Re-numbers playSequence as 1, 2, 3… after any add / remove / reorder.
 * Mutates the array in place (array is always a local copy before this is called).
 */
export function renumberSequences(rows: MvCreativeRow[]): void {
  rows.forEach((row, i) => (row.playSequence = i + 1));
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

/**
 * Maps MvCampaignScreen (DB model) → MvScreenSlot (UI model).
 * Called when campaign detail loads; playDate and creatives start empty.
 */
export function toScreenSlot(screen: MvCampaignScreen): MvScreenSlot {
  return {
    screenId:   screen.screenId,
    screenName: screen.screenName,
    playDate:   null,
    creatives:  [],
  };
}



