import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HabitResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class HabitResponseDto extends createZodDto(HabitResponseSchema) {}
