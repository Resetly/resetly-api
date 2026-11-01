import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AccountDeletionResponseSchema = z.object({
  message: z.string(),
  deletedAt: z.string(),
});

export class AccountDeletionResponseDto extends createZodDto(AccountDeletionResponseSchema) {}
