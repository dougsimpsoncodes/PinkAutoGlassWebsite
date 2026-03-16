/**
 * Client-side date utilities for consistent timezone handling
 *
 * All dashboard pages should use these functions to ensure "Today"
 * means the same thing everywhere (Mountain Time / Denver timezone).
 */

export type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';

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
