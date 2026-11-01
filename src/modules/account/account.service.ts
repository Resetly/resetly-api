import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { users } from '../../database/schema/users.table';
import { AccountDeletionResponseDto } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  /**
   * Complete account deletion.
   * All foreign keys cascade down from the users table,
   * guaranteeing that user data, habits, journeys, check-ins, and tokens
   * are cleanly erased in a single atomic database operation.
   */
  async deleteAccount(userId: string): Promise<AccountDeletionResponseDto> {
    const [deleted] = await this.db.delete(users).where(eq(users.id, userId)).returning();

    if (!deleted) {
      throw new NotFoundException('Account not found');
    }

    return {
      message: 'Your account and all associated data have been permanently deleted.',
      deletedAt: new Date().toISOString(),
    };
  }
}
