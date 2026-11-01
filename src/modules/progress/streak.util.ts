export type CheckInOutcome = 'maintained' | 'setback';

export interface CheckInRecord {
  date: string; // Plain YYYY-MM-DD format
  outcome: CheckInOutcome;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalSuccessfulDays: number;
  totalCheckIns: number;
}

export interface StreakCalculationOptions {
  /**
   * Optional reference date (YYYY-MM-DD) representing "today".
   * If provided and the user has missed both today and yesterday,
   * currentStreak drops to 0. If omitted, currentStreak reflects the streak
   * as of the latest recorded check-in.
   */
  referenceDate?: string;
}

/**
 * Converts a plain YYYY-MM-DD string to UTC day integer epoch.
 * Completely immune to local timezones and DST changes.
 */
export function dateStringToDayEpoch(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format "${dateStr}". Expected YYYY-MM-DD.`);
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date format "${dateStr}". Expected valid numeric YYYY-MM-DD.`);
  }

  const MS_PER_DAY = 86_400_000;
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

/**
 * Pure function to calculate habit progress stats from a list of check-ins.
 *
 * Rules:
 * - A setback ends the current streak, but never erases history or longest streak.
 * - Missing days (gaps) break consecutive streaks.
 * - Duplicate dates are safely deduplicated (if any outcome on that day is 'setback', that day is a setback).
 * - Statistics and streaks are 100% derived, never fabricated.
 */
export function calculateStreakStats(
  checkIns: readonly CheckInRecord[],
  options?: StreakCalculationOptions,
): StreakStats {
  if (!checkIns || checkIns.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSuccessfulDays: 0,
      totalCheckIns: 0,
    };
  }

  // 1. Deduplicate by date safely
  // If duplicate records exist for the same day, setback takes precedence.
  const dateMap = new Map<string, { epoch: number; outcome: CheckInOutcome }>();

  for (const record of checkIns) {
    if (!record.date || !record.outcome) continue;
    const epoch = dateStringToDayEpoch(record.date);
    const existing = dateMap.get(record.date);

    if (!existing) {
      dateMap.set(record.date, { epoch, outcome: record.outcome });
    } else if (existing.outcome === 'maintained' && record.outcome === 'setback') {
      dateMap.set(record.date, { epoch, outcome: 'setback' });
    }
  }

  const uniqueDays = Array.from(dateMap.values());
  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalSuccessfulDays: 0,
      totalCheckIns: 0,
    };
  }

  // 2. Sort chronologically ascending
  uniqueDays.sort((a, b) => a.epoch - b.epoch);

  let totalSuccessfulDays = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < uniqueDays.length; i++) {
    const current = uniqueDays[i];

    if (i > 0) {
      const prev = uniqueDays[i - 1];
      const gap = current.epoch - prev.epoch;

      // Gap > 1 means one or more calendar days were missed
      if (gap > 1) {
        runningStreak = 0;
      }
    }

    if (current.outcome === 'maintained') {
      totalSuccessfulDays++;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      // Setback ends the running streak, but leaves longestStreak intact
      runningStreak = 0;
    }
  }

  let currentStreak = runningStreak;

  // 3. Optional referenceDate validation
  // If a reference date ("today") is supplied, check whether the streak is still active
  if (options?.referenceDate) {
    const todayEpoch = dateStringToDayEpoch(options.referenceDate);
    const latestDayEpoch = uniqueDays[uniqueDays.length - 1].epoch;
    const gapFromToday = todayEpoch - latestDayEpoch;

    // If latest check-in is older than yesterday, the streak is broken due to missing days
    if (gapFromToday > 1) {
      currentStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalSuccessfulDays,
    totalCheckIns: checkIns.length,
  };
}
