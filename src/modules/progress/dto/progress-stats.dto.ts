import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ProgressStatsSchema = z.object({
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  totalSuccessfulDays: z.number().int().nonnegative(),
  totalCheckIns: z.number().int().nonnegative(),
});

export class ProgressStatsDto extends createZodDto(ProgressStatsSchema) {}
