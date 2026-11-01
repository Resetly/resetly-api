import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { checkIns } from '../../database/schema/check-ins.table';
import { journeys } from '../../database/schema/journeys.table';
import { habits } from '../../database/schema/habits.table';
import { calculateStreakStats } from './streak.util';
import { ProgressStatsDto } from './dto/progress-stats.dto';

@Injectable()
export class ProgressService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  /**
   * Derives progress and streaks dynamically from check-in records.
   * Streaks are NEVER stored in a database counter.
   */
  async getJourneyProgress(userId: string, journeyId: string): Promise<ProgressStatsDto> {
    const records = await this.db
      .select({
        date: checkIns.date,
        outcome: checkIns.outcome,
      })
      .from(checkIns)
      .innerJoin(journeys, eq(checkIns.journeyId, journeys.id))
      .innerJoin(habits, eq(journeys.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(checkIns.journeyId, journeyId)));

    return calculateStreakStats(records);
  }
}
