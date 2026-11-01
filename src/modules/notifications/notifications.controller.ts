import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { NotificationsService } from './notifications.service';
import { RegisterPushTokenDto } from './dto/push-token.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a device push token for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Device token registered successfully',
  })
  async registerToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterPushTokenDto,
  ): Promise<{ success: boolean }> {
    return this.notificationsService.registerToken(user.userId, dto);
  }
}
