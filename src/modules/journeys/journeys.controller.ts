import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { JourneysService } from './journeys.service';
import { JourneyResponseDto } from './dto/journey-response.dto';

@ApiTags('journeys')
@ApiBearerAuth()
@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Get('habit/:habitId')
  @ApiOperation({ summary: 'Get journeys for a habit (scoped to authenticated user)' })
  @ApiParam({ name: 'habitId', description: 'Habit UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of journeys for the habit',
    type: [JourneyResponseDto],
  })
  async getJourneys(
    @CurrentUser() user: AuthenticatedUser,
    @Param('habitId') habitId: string,
  ): Promise<JourneyResponseDto[]> {
    return this.journeysService.findByHabitId(user.userId, habitId);
  }
}
