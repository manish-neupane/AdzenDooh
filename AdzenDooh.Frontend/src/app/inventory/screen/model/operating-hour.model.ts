// ─── DayOfWeek enum ───────────────────────────────────────────────────────────
// Matches SQL Server's TINYINT convention: 0 = Sunday ... 6 = Saturday
export enum DayOfWeek {
  Sunday    = 0,
  Monday    = 1,
  Tuesday   = 2,
  Wednesday = 3,
  Thursday  = 4,
  Friday    = 5,
  Saturday  = 6
}

export const DAY_OPTIONS = [
  { label: 'Sunday',    value: DayOfWeek.Sunday    },
  { label: 'Monday',    value: DayOfWeek.Monday    },
  { label: 'Tuesday',   value: DayOfWeek.Tuesday   },
  { label: 'Wednesday', value: DayOfWeek.Wednesday },
  { label: 'Thursday',  value: DayOfWeek.Thursday  },
  { label: 'Friday',    value: DayOfWeek.Friday    },
  { label: 'Saturday',  value: DayOfWeek.Saturday  },
];

// ─── Read model (returned by GetSlots) ────────────────────────────────────────
export interface MvScreenOperatingHour {
  id:                   number;
  screenId:             number;
  dayOfWeek:            DayOfWeek;
  startTime:            string;   // ISO datetime string from SQL
  endTime:              string;
  averageAudienceCount: number | null;
  createdAt:            string;
  createdBy:            number;
}

// ─── Filter (sent to GetSlots) ────────────────────────────────────────────────
export interface MvScreenOperatingHourFilter {
  screenId: number;
}

// ─── Write model (sent to AddSlots) ───────────────────────────────────────────
export interface MvAddScreenOperatingHour {
  screenId:             number;
  createdBy:            number;
  dayOfWeek:            DayOfWeek;
  startTime:            string;   // "2026-01-01T{HH:mm}:00"
  endTime:              string;
  averageAudienceCount: number | null;
}

// ─── Delete model (sent to DeleteSlot) ────────────────────────────────────────
export interface MvDeleteScreenOperatingHour {
  id:        number;
  deletedBy: number;
}