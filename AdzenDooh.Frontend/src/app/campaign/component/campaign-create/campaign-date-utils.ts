import { DateRowValue } from '../../model/campaign.model';

// ── Date Formatting ───────────────────────────────────────────────────────────

/*
   Converts a Date object or ISO string to a "YYYY-MM-DD" string for the API.
   e.g. Date('2025-01-15') → "2025-01-15"
 
   */
export function formatDate(date: Date | string): string {
  return (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];
}

/*
  Converts an array of DateRowValues (with Date objects) into
  API-ready { startDate, endDate } string pairs.
 
  */
export function buildDatePayload(
  rows: DateRowValue[]
): { startDate: string; endDate: string }[] {
  return rows.map(d => ({
    startDate: formatDate(d.startDate!),
    endDate:   formatDate(d.endDate!),
  }));
}

// ── Date Validation ───────────────────────────────────────────────────────────


export function validateDateRanges(ranges: DateRowValue[]): string | null {
  const today = startOfDay(new Date());
  const validated: { start: Date; end: Date; index: number }[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const rowLabel = `Row ${i + 1}`;
    const { startDate, endDate } = ranges[i];

    // ── Guard: values must exist ──────────────────────────────────────────────
    if (!startDate || !endDate) {
      return `${rowLabel}: Both start and end dates are required.`;
    }

    const start = startOfDay(new Date(startDate));
    const end   = startOfDay(new Date(endDate));

    // ── Guard: must be valid dates ────────────────────────────────────────────
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${rowLabel}: Invalid date selected.`;
    }

    // ── Must not be in the past ───────────────────────────────────────────────
    if (start < today) return `${rowLabel}: Start date cannot be in the past.`;
    if (end   < today) return `${rowLabel}: End date cannot be in the past.`;

    // ── End must be strictly after start ──────────────────────────────────────
    if (end <= start) return `${rowLabel}: End date must be after start date.`;

    // ── Overlap check against all previous rows ───────────────────────────────
    for (const existing of validated) {
      if (start <= existing.end && end >= existing.start) {
        return `Row ${i + 1} overlaps with Row ${existing.index + 1}. Date ranges cannot overlap.`;
      }
    }

    validated.push({ start, end, index: i });
  }

  return null;
}

// ── Internal Helper ───────────────────────────────────────────────────────────

/** Zeroes out the time portion of a date for pure date comparisons. */
function startOfDay(date: Date): Date {
  date.setHours(0, 0, 0, 0);
  return date;
}