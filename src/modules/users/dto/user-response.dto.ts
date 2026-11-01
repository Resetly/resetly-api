import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
