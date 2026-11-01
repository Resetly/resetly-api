import { createZodDto } from 'nestjs-zod';
import { CreateHabitSchema } from './create-habit.dto';

export const UpdateHabitSchema = CreateHabitSchema.partial();

export class UpdateHabitDto extends createZodDto(UpdateHabitSchema) {}
