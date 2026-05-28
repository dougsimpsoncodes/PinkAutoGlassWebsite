/**
 * Booking-slot helpers for the quote scheduler.
 *
 * Per Doug 2026-05-28 (Dan's constraint):
 *   - No same-day appointments. Customer always books for tomorrow or later.
 *   - Pink works Monday through Saturday. Sundays off.
 *   - US federal holidays are non-working days.
 *
 * The form offers the next 2 working days after today, each with an
 * AM (8a-12p) and PM (12p-5p) window — 4 pills total.
 *
 * Pill day labels: "Tomorrow" only when the offered day is literally
 * today + 1. Otherwise the day-of-week abbreviation (e.g., a Saturday
 * customer sees "Mon" not "Tomorrow Mon", because Monday is two days out).
 */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * US federal holidays Pink does not dispatch. Maintain this list as
 * a flat ISO YYYY-MM-DD array; the year-rollover happens once per year.
 * Columbus Day is intentionally omitted (many businesses don't observe).
 */
const US_FEDERAL_HOLIDAYS: ReadonlyArray<string> = [
  // 2026
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-02-16', // Presidents Day
  '2026-05-25', // Memorial Day
  '2026-06-19', // Juneteenth
  '2026-07-04', // Independence Day
  '2026-09-07', // Labor Day
  '2026-11-11', // Veterans Day
  '2026-11-26', // Thanksgiving
  '2026-12-25', // Christmas
  // 2027
  '2027-01-01',
  '2027-01-18',
  '2027-02-15',
  '2027-05-31',
  '2027-06-19',
  '2027-07-05', // Jul 4 is Sun → Mon observed
  '2027-09-06',
  '2027-11-11',
  '2027-11-25',
  '2027-12-25',
];
const HOLIDAY_SET = new Set(US_FEDERAL_HOLIDAYS);

export function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isHoliday(date: Date): boolean {
  return HOLIDAY_SET.has(toIsoLocal(date));
}

export function isWorkingDay(date: Date): boolean {
  // Pink works Mon-Sat. Sundays off.
  if (date.getDay() === 0) return false;
  if (isHoliday(date)) return false;
  return true;
}

/**
 * Returns the next two working days strictly after `now`. Same-day is
 * never returned (per Dan's no-same-day rule).
 */
export function getNextTwoWorkingDays(now: Date): [Date, Date] {
  const results: Date[] = [];
  // Start cursor at midnight of `now`'s date so we iterate by calendar days
  // independent of clock time.
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Safety bound — at most 14 calendar days lookup to find 2 working days,
  // which would only fail if half the calendar is holidays. Never happens.
  for (let i = 0; i < 14 && results.length < 2; i += 1) {
    cursor.setDate(cursor.getDate() + 1);
    if (isWorkingDay(cursor)) results.push(new Date(cursor));
  }
  if (results.length < 2) {
    throw new Error('No working days found in the next 14 days — check holiday config.');
  }
  return [results[0], results[1]];
}

/** True if `date` is literally today + 1 (same year, month, day). */
export function isTomorrow(date: Date, now: Date): boolean {
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  t.setDate(t.getDate() + 1);
  return date.getFullYear() === t.getFullYear()
    && date.getMonth() === t.getMonth()
    && date.getDate() === t.getDate();
}

export function pillDayLabel(date: Date, now: Date): string {
  if (isTomorrow(date, now)) return 'Tomorrow';
  return DAY_NAMES[date.getDay()];
}

export function pillDateLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
