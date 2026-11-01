import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const JourneyResponseSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  startDate: z.string(),
  goal: z.string().nullable(),
  status: z.enum(['active', 'paused', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class JourneyResponseDto extends createZodDto(JourneyResponseSchema) {}
