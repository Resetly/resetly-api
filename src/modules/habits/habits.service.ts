import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { habits } from '../../database/schema/habits.table';
import { CreateHabitDto, UpdateHabitDto, HabitResponseDto } from './dto';

@Injectable()
export class HabitsService {
  constructor(
    @Inject(DRIZZLE_CLIENT)
    private readonly db: DrizzleClient,
  ) {}

  async create(userId: string, dto: CreateHabitDto): Promise<HabitResponseDto> {
    const [record] = await this.db
      .insert(habits)
      .values({
        userId,
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category,
      })
      .returning();

    return record;
  }

  async findAll(userId: string): Promise<HabitResponseDto[]> {
    return this.db.select().from(habits).where(eq(habits.userId, userId));
  }

  async findById(userId: string, id: string): Promise<HabitResponseDto> {
    const [record] = await this.db
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    if (!record) {
      throw new NotFoundException('Habit not found');
    }

    return record;
  }

  async update(userId: string, id: string, dto: UpdateHabitDto): Promise<HabitResponseDto> {
    const [record] = await this.db
      .update(habits)
      .set({
        ...dto,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    if (!record) {
      throw new NotFoundException('Habit not found');
    }

    return record;
  }

  async delete(userId: string, id: string): Promise<void> {
    const [record] = await this.db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    if (!record) {
      throw new NotFoundException('Habit not found');
    }
  }
}
