import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Habit name is required')
    .max(128, 'Habit name cannot exceed 128 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(64, 'Category cannot exceed 64 characters'),
});

export class CreateHabitDto extends createZodDto(CreateHabitSchema) {}
