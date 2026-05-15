import { DateRowValue } from '../../model/campaign.model';

// Date formatting
export function formatDate(date: Date | string): string {
  return (date instanceof Date ? date : new Date(date)).toISOString().split('T')[0];
}

export function buildDatePayload(
  rows: DateRowValue[]
): { startDate: string; endDate: string }[] {
  return rows.map(d => ({
    startDate: formatDate(d.startDate!),
    endDate:   formatDate(d.endDate!),
  }));
}

// Date validation
export function validateDateRanges(ranges: DateRowValue[]): string | null {
  const today = startOfDay(new Date());
  const validated: { start: Date; end: Date; index: number }[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const rowLabel = `Row ${i + 1}`;
    const { startDate, endDate } = ranges[i];

    if (!startDate || !endDate) {
      return `${rowLabel}: Both start and end dates are required.`;
    }

    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${rowLabel}: Invalid date selected.`;
    }

    if (start < today) return `${rowLabel}: Start date cannot be in the past.`;
    if (end < today) return `${rowLabel}: End date cannot be in the past.`;
    if (end <= start) return `${rowLabel}: End date must be after start date.`;

    for (const existing of validated) {
      if (start <= existing.end && end >= existing.start) {
        return `Row ${i + 1} overlaps with Row ${existing.index + 1}. Date ranges cannot overlap.`;
      }
    }

    validated.push({ start, end, index: i });
  }

  return null;
}

function startOfDay(date: Date): Date {
  date.setHours(0, 0, 0, 0);
  return date;
}