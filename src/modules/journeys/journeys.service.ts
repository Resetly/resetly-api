import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { journeys } from '../../database/schema/journeys.table';
import { habits } from '../../database/schema/habits.table';
import { JourneyResponseDto } from './dto/journey-response.dto';

@Injectable()
export class JourneysService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  async findByHabitId(userId: string, habitId: string): Promise<JourneyResponseDto[]> {
    return this.db
      .select({
        id: journeys.id,
        habitId: journeys.habitId,
        startDate: journeys.startDate,
        goal: journeys.goal,
        status: journeys.status,
        createdAt: journeys.createdAt,
        updatedAt: journeys.updatedAt,
      })
      .from(journeys)
      .innerJoin(habits, eq(journeys.habitId, habits.id))
      .where(and(eq(habits.userId, userId), eq(journeys.habitId, habitId)));
  }
}
