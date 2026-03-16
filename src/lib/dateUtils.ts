/**
 * Date utilities for consistent Mountain Time handling (client + server).
 *
 * ALL date filtering across the dashboard must use these functions.
 * Business is in Denver → America/Denver timezone (DST-aware).
 *
 * Key function: getMountainDayBounds(period) returns UTC ISO strings
 * for Supabase gte/lte filters. This is the single source of truth
 * for period boundaries — no ad-hoc timezone math elsewhere.
 */

export type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';

/**
 * UTC boundary strings for database queries.
 * startUTC/endUTC are ISO strings representing Mountain Time day boundaries in UTC.
 * Use with Supabase: .gte('created_at', bounds.startUTC).lte('created_at', bounds.endUTC)
 *
 * For date-only columns (e.g., omega_installs.install_date, google_ads_daily.date),
 * use startDate/endDate (YYYY-MM-DD strings in Mountain Time).
 */
export interface MountainDayBounds {
  startUTC: string;   // ISO string — start of period in UTC
  endUTC: string;     // ISO string — end of period (now) in UTC
  startDate: string;  // YYYY-MM-DD in Mountain Time (for date-only columns)
  endDate: string;    // YYYY-MM-DD in Mountain Time (for date-only columns)
  display: string;    // Human-readable label
}

/**
 * Get UTC boundaries for a Mountain Time period.
 * This is the CANONICAL function for all date filtering — server and client.
 *
 * Converts Mountain Time day boundaries to UTC ISO strings so Supabase
 * queries filter correctly regardless of server timezone.
 */
export function getMountainDayBounds(period: DateFilter): MountainDayBounds {
  const now = new Date();
  const mtNow = getMountainTime();

  // Today's date string in MT
  const todayStr = _mtDateStr(now);

  let startDateStr: string;
  let endDateStr: string;
  let display: string;

  switch (period) {
    case 'today':
      startDateStr = todayStr;
      endDateStr = todayStr;
      display = mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      break;

    case 'yesterday': {
      const yd = new Date(now.getTime() - 86400000);
      const ydStr = _mtDateStr(yd);
      startDateStr = ydStr;
      endDateStr = ydStr;
      display = new Date(ydStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Denver' });
      break;
    }

    case '7days': {
      const sd = new Date(now.getTime() - 7 * 86400000);
      startDateStr = _mtDateStr(sd);
      endDateStr = todayStr;
      const startLabel = new Date(startDateStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Denver' });
      const endLabel = mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      display = `${startLabel} - ${endLabel}`;
      break;
    }

    case '30days': {
      const sd = new Date(now.getTime() - 30 * 86400000);
      startDateStr = _mtDateStr(sd);
      endDateStr = todayStr;
      const startLabel = new Date(startDateStr + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Denver' });
      const endLabel = mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      display = `${startLabel} - ${endLabel}`;
      break;
    }

    case 'all':
    default:
      startDateStr = '2024-01-01';
      endDateStr = todayStr;
      display = `Jan 1, 2024 - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      break;
  }

  // Convert MT day boundaries to UTC: midnight MT = midnight + offset
  const startOffsetMs = _getMtOffsetMs(startDateStr);
  const startUTC = new Date(new Date(startDateStr + 'T00:00:00Z').getTime() + startOffsetMs).toISOString();
  const endUTC = now.toISOString(); // "now" is always the end for non-yesterday periods

  // For yesterday, end is end-of-day
  const finalEndUTC = period === 'yesterday'
    ? new Date(new Date(endDateStr + 'T23:59:59.999Z').getTime() + _getMtOffsetMs(endDateStr)).toISOString()
    : endUTC;

  return {
    startUTC,
    endUTC: finalEndUTC,
    startDate: startDateStr,
    endDate: endDateStr,
    display,
  };
}

/** Get YYYY-MM-DD string in Mountain Time for a given UTC Date */
function _mtDateStr(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Denver' }); // en-CA = YYYY-MM-DD
}

/** Get UTC offset in ms for a given date in Denver (positive = behind UTC) */
function _getMtOffsetMs(dateStr: string): number {
  const refNoon = new Date(`${dateStr}T12:00:00Z`);
  const mtNoonStr = refNoon.toLocaleString('en-US', { timeZone: 'America/Denver' });
  const mtNoon = new Date(mtNoonStr);
  return refNoon.getTime() - mtNoon.getTime();
}

/**
 * Get current time in Mountain Time (Denver timezone, DST-aware)
 * Business is located in Denver, so all date calculations use Mountain Time
 */
export function getMountainTime(): Date {
  const now = new Date();
  // Use Intl to get the correct Mountain Time including DST transitions
  const mtString = now.toLocaleString('en-US', { timeZone: 'America/Denver' });
  return new Date(mtString);
}

/**
 * Get start of today in Mountain Time
 */
export function getMountainToday(): Date {
  const mtNow = getMountainTime();
  return new Date(mtNow.getFullYear(), mtNow.getMonth(), mtNow.getDate());
}

export interface DateRange {
  start: Date;
  end: Date;
  display: string;
}

/**
 * Get date range for a given period filter using Mountain Time
 * Consistent with server-side getMountainDateRange()
 */
export function getDateRange(period: DateFilter): DateRange {
  const mtNow = getMountainTime();
  const today = getMountainToday();

  switch (period) {
    case 'today':
      return {
        start: today,
        end: mtNow,
        display: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return {
        start: yesterday,
        end: yesterdayEnd,
        display: yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
    }

    case '7days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        start: sevenDaysAgo,
        end: mtNow,
        display: `${sevenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    }

    case '30days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        start: thirtyDaysAgo,
        end: mtNow,
        display: `${thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    }

    case 'all':
    default: {
      const allTimeStart = new Date('2024-01-01');
      return {
        start: allTimeStart,
        end: mtNow,
        display: `${allTimeStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${mtNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    }
  }
}

/**
 * Check if a date falls within a date range
 */
export function isInDateRange(date: Date | string, range: DateRange): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= range.start && d <= range.end;
}
