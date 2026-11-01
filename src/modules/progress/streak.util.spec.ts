import { calculateStreakStats, dateStringToDayEpoch, CheckInRecord } from './streak.util';

describe('streak.util', () => {
  describe('dateStringToDayEpoch', () => {
    it('correctly converts valid YYYY-MM-DD date to day epoch', () => {
      const epoch1 = dateStringToDayEpoch('2026-01-01');
      const epoch2 = dateStringToDayEpoch('2026-01-02');
      expect(epoch2 - epoch1).toBe(1);
    });

    it('correctly handles month boundaries without timezone shift', () => {
      const jan31 = dateStringToDayEpoch('2026-01-31');
      const feb01 = dateStringToDayEpoch('2026-02-01');
      expect(feb01 - jan31).toBe(1);
    });

    it('correctly handles year boundaries', () => {
      const dec31 = dateStringToDayEpoch('2026-12-31');
      const jan01 = dateStringToDayEpoch('2027-01-01');
      expect(jan01 - dec31).toBe(1);
    });

    it('throws on invalid date string format', () => {
      expect(() => dateStringToDayEpoch('invalid-date')).toThrow();
      expect(() => dateStringToDayEpoch('2026/01/01')).toThrow();
    });
  });

  describe('calculateStreakStats', () => {
    it('returns all zeros for empty check-in history', () => {
      const stats = calculateStreakStats([]);
      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalSuccessfulDays: 0,
        totalCheckIns: 0,
      });
    });

    it('handles a single day maintained', () => {
      const history: CheckInRecord[] = [{ date: '2026-10-01', outcome: 'maintained' }];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 1,
        longestStreak: 1,
        totalSuccessfulDays: 1,
        totalCheckIns: 1,
      });
    });

    it('handles a single day setback', () => {
      const history: CheckInRecord[] = [{ date: '2026-10-01', outcome: 'setback' }];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalSuccessfulDays: 0,
        totalCheckIns: 1,
      });
    });

    it('calculates continuous maintained streaks across multiple consecutive days', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
        { date: '2026-10-03', outcome: 'maintained' },
        { date: '2026-10-04', outcome: 'maintained' },
        { date: '2026-10-05', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 5,
        longestStreak: 5,
        totalSuccessfulDays: 5,
        totalCheckIns: 5,
      });
    });

    it('resets current streak upon setback but preserves longest streak and total success days', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
        { date: '2026-10-03', outcome: 'maintained' },
        { date: '2026-10-04', outcome: 'setback' }, // setback on day 4
        { date: '2026-10-05', outcome: 'maintained' },
        { date: '2026-10-06', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 2,
        longestStreak: 3,
        totalSuccessfulDays: 5,
        totalCheckIns: 6,
      });
    });

    it('ends with setback: currentStreak is 0, longestStreak remains intact', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
        { date: '2026-10-03', outcome: 'maintained' },
        { date: '2026-10-04', outcome: 'setback' },
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 3,
        totalSuccessfulDays: 3,
        totalCheckIns: 4,
      });
    });

    it('breaks streak when there is a missing day (gap)', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
        // 2026-10-03 is missing (gap!)
        { date: '2026-10-04', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 1,
        longestStreak: 2,
        totalSuccessfulDays: 3,
        totalCheckIns: 3,
      });
    });

    it('handles unsorted input arrays correctly', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-03', outcome: 'maintained' },
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 3,
        longestStreak: 3,
        totalSuccessfulDays: 3,
        totalCheckIns: 3,
      });
    });

    it('safely deduplicates records on the same date with setback taking precedence', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'setback' }, // duplicate date with setback
      ];
      const stats = calculateStreakStats(history);
      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 1,
        totalSuccessfulDays: 1,
        totalCheckIns: 3,
      });
    });

    it('evaluates referenceDate correctly when user checked in today', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history, { referenceDate: '2026-10-02' });
      expect(stats.currentStreak).toBe(2);
    });

    it('evaluates referenceDate correctly when user checked in yesterday (today pending)', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
      ];
      const stats = calculateStreakStats(history, { referenceDate: '2026-10-03' });
      expect(stats.currentStreak).toBe(2);
    });

    it('drops currentStreak to 0 when last check-in is older than yesterday', () => {
      const history: CheckInRecord[] = [
        { date: '2026-10-01', outcome: 'maintained' },
        { date: '2026-10-02', outcome: 'maintained' },
      ];
      // Today is 2026-10-05, last check-in was 2026-10-02 (missed Oct 3 and Oct 4)
      const stats = calculateStreakStats(history, { referenceDate: '2026-10-05' });
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(2);
      expect(stats.totalSuccessfulDays).toBe(2);
    });
  });
});
