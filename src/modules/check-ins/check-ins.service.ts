import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { checkIns } from '../../database/schema/check-ins.table';
import { journeys } from '../../database/schema/journeys.table';
import { habits } from '../../database/schema/habits.table';
import { CheckInResponseDto } from './dto/check-in-response.dto';

@Injectable()
export class CheckInsService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  async findByJourneyId(userId: string, journeyId: string): Promise<CheckInResponseDto[]> {
    return this.db
      .select({
        id: checkIns.id,
        journeyId: checkIns.journeyId,
        date: checkIns.date,
        outcome: checkIns.outcome,
        note: checkIns.note,
        createdAt: checkIns.createdAt,
      })
      .from(checkIns)
      .innerJoin(journeys, eq(checkIns.journeyId, journeys.id))
      .innerJoin(habits, eq(journeys.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(checkIns.journeyId, journeyId)));
  }
}
