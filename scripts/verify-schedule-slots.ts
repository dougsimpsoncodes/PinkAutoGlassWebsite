#!/usr/bin/env -S npx tsx
/**
 * Guard for the booking-slot helpers in src/lib/quote/schedule-slots.ts.
 *
 * Locks the rules Dan locked on 2026-05-28:
 *   - No same-day appointments (today is never returned)
 *   - Pink works Mon-Sat; Sundays off
 *   - US federal holidays are non-working days
 *   - Day-1 labeled "Tomorrow" only when literally today + 1
 *
 * Usage:
 *   npx tsx scripts/verify-schedule-slots.ts
 */

import {
  getNextTwoWorkingDays,
  isHoliday,
  isTomorrow,
  isWorkingDay,
  pillDayLabel,
  pillDateLabel,
  toIsoLocal,
} from '../src/lib/quote/schedule-slots';

let failures = 0;
function assert(condition: boolean, label: string, detail?: string) {
  if (!condition) {
    failures += 1;
    console.error(`✗ ${label}${detail ? ': ' + detail : ''}`);
  }
}

// Helper: build a Date at noon local time on a given y/m/d so we never
// flirt with DST boundaries or UTC-midnight rollover.
function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

// === isWorkingDay ===
{
  // 2026-05-28 is a Thursday — standard working day
  assert(isWorkingDay(localDate(2026, 5, 28)), 'Thursday is a working day');
  // 2026-05-30 is a Saturday — working day
  assert(isWorkingDay(localDate(2026, 5, 30)), 'Saturday is a working day');
  // 2026-05-31 is a Sunday — NOT a working day
  assert(!isWorkingDay(localDate(2026, 5, 31)), 'Sunday is not a working day');
  // 2026-12-25 is Christmas (Friday) — NOT a working day
  assert(!isWorkingDay(localDate(2026, 12, 25)), 'Christmas is not a working day');
  // 2026-07-04 is Independence Day (Saturday) — NOT a working day
  assert(!isWorkingDay(localDate(2026, 7, 4)), 'July 4 (Saturday) is not a working day');
}

// === isHoliday ===
{
  assert(isHoliday(localDate(2026, 1, 1)), '2026-01-01 New Year is a holiday');
  assert(isHoliday(localDate(2026, 11, 26)), '2026-11-26 Thanksgiving is a holiday');
  assert(!isHoliday(localDate(2026, 11, 27)), '2026-11-27 Black Friday is NOT a holiday');
  assert(!isHoliday(localDate(2026, 5, 28)), '2026-05-28 (random Thursday) is not a holiday');
}

// === getNextTwoWorkingDays ===
{
  // Today is Thursday 5/28 → day-1 = Fri 5/29, day-2 = Sat 5/30 (skip Sun)
  const [a, b] = getNextTwoWorkingDays(localDate(2026, 5, 28));
  assert(toIsoLocal(a) === '2026-05-29', 'Thu → day1 is Fri', `got ${toIsoLocal(a)}`);
  assert(toIsoLocal(b) === '2026-05-30', 'Thu → day2 is Sat', `got ${toIsoLocal(b)}`);

  // Today is Friday 5/29 → day-1 = Sat 5/30, day-2 = Mon 6/1 (skip Sun)
  const [c, d] = getNextTwoWorkingDays(localDate(2026, 5, 29));
  assert(toIsoLocal(c) === '2026-05-30', 'Fri → day1 is Sat', `got ${toIsoLocal(c)}`);
  assert(toIsoLocal(d) === '2026-06-01', 'Fri → day2 is Mon (skip Sun)', `got ${toIsoLocal(d)}`);

  // Today is Saturday 5/30 → day-1 = Mon 6/1 (skip Sun), day-2 = Tue 6/2
  const [e, f] = getNextTwoWorkingDays(localDate(2026, 5, 30));
  assert(toIsoLocal(e) === '2026-06-01', 'Sat → day1 is Mon (skip Sun)', `got ${toIsoLocal(e)}`);
  assert(toIsoLocal(f) === '2026-06-02', 'Sat → day2 is Tue', `got ${toIsoLocal(f)}`);

  // Today is Sunday 5/31 → day-1 = Mon 6/1, day-2 = Tue 6/2
  const [g, h] = getNextTwoWorkingDays(localDate(2026, 5, 31));
  assert(toIsoLocal(g) === '2026-06-01', 'Sun → day1 is Mon', `got ${toIsoLocal(g)}`);
  assert(toIsoLocal(h) === '2026-06-02', 'Sun → day2 is Tue', `got ${toIsoLocal(h)}`);

  // Christmas Eve 2026 (Thu Dec 24) — tomorrow is Christmas (skip), day-after is Sat 12/26
  // → day-1 = Sat 12/26, day-2 = Mon 12/28 (skip Sun)
  const [i, j] = getNextTwoWorkingDays(localDate(2026, 12, 24));
  assert(toIsoLocal(i) === '2026-12-26', 'Christmas Eve → day1 is Sat 12/26 (skip Christmas)', `got ${toIsoLocal(i)}`);
  assert(toIsoLocal(j) === '2026-12-28', 'Christmas Eve → day2 is Mon 12/28 (skip Sun)', `got ${toIsoLocal(j)}`);

  // Day before July 4 2026 (Fri Jul 3) — Sat Jul 4 is Independence Day (skip)
  // → day-1 = Mon Jul 6 (skip Sun and holiday Sat)
  const [k, l] = getNextTwoWorkingDays(localDate(2026, 7, 3));
  assert(toIsoLocal(k) === '2026-07-06', 'Jul 3 → day1 is Mon Jul 6 (skip Jul 4 holiday + Sun)', `got ${toIsoLocal(k)}`);
  assert(toIsoLocal(l) === '2026-07-07', 'Jul 3 → day2 is Tue Jul 7', `got ${toIsoLocal(l)}`);

  // Same-day never returned — sanity that day-1 is strictly after today
  const [m] = getNextTwoWorkingDays(localDate(2026, 5, 28));
  assert(toIsoLocal(m) !== '2026-05-28', 'Same-day is never returned');
}

// === pillDayLabel ===
{
  const thursday = localDate(2026, 5, 28);
  const friday = localDate(2026, 5, 29);
  const saturday = localDate(2026, 5, 30);
  const monday = localDate(2026, 6, 1);

  // Thursday's customer: Fri is tomorrow, Sat is not
  assert(pillDayLabel(friday, thursday) === 'Tomorrow', 'Fri labeled Tomorrow when today is Thu');
  assert(pillDayLabel(saturday, thursday) === 'Sat', 'Sat labeled Sat when today is Thu', `got ${pillDayLabel(saturday, thursday)}`);

  // Saturday's customer: Monday is NOT tomorrow (Sunday is, but Sunday is skipped)
  assert(pillDayLabel(monday, saturday) === 'Mon', 'Mon labeled Mon when today is Sat', `got ${pillDayLabel(monday, saturday)}`);
  assert(pillDayLabel(monday, saturday) !== 'Tomorrow', 'Monday is NOT "Tomorrow" when today is Saturday');
}

// === isTomorrow ===
{
  const thursday = localDate(2026, 5, 28);
  const friday = localDate(2026, 5, 29);
  const saturday = localDate(2026, 5, 30);
  assert(isTomorrow(friday, thursday), 'Fri is tomorrow for Thu');
  assert(!isTomorrow(saturday, thursday), 'Sat is not tomorrow for Thu');
}

// === pillDateLabel ===
{
  assert(pillDateLabel(localDate(2026, 5, 29)) === '5/29', 'pillDateLabel 5/29');
  assert(pillDateLabel(localDate(2026, 12, 7)) === '12/7', 'pillDateLabel 12/7');
}

if (failures > 0) {
  console.error(`\n${failures} schedule-slots assertion(s) failed.`);
  process.exit(1);
}
console.log('[schedule-slots] Guard passed.');
