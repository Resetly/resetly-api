import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CheckInResponseSchema = z.object({
  id: z.string().uuid(),
  journeyId: z.string().uuid(),
  date: z.string(),
  outcome: z.enum(['maintained', 'setback']),
  note: z.string().nullable(),
  createdAt: z.string(),
});

export class CheckInResponseDto extends createZodDto(CheckInResponseSchema) {}
