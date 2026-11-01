import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_CLIENT, DrizzleClient } from '../../database/database.module';
import { pushTokens } from '../../database/schema/push-tokens.table';
import { RegisterPushTokenDto } from './dto/push-token.dto';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleClient) {}

  /**
   * Registers a user device push token.
   * Privacy note: Habit names are NEVER exposed in push notifications.
   */
  async registerToken(userId: string, dto: RegisterPushTokenDto): Promise<{ success: boolean }> {
    await this.db.insert(pushTokens).values({
      userId,
      token: dto.token,
      platform: dto.platform,
    });

    return { success: true };
  }
}
