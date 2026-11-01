import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  timestamp: z.string(),
  database: z.enum(['connected', 'disconnected']),
});

export class HealthResponseDto extends createZodDto(HealthResponseSchema) {}
