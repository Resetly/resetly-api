import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterPushTokenSchema = z.object({
  token: z.string().trim().min(1, 'Push token is required'),
  platform: z.enum(['ios', 'android', 'web']),
});

export class RegisterPushTokenDto extends createZodDto(RegisterPushTokenSchema) {}
