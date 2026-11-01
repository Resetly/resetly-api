import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { ProgressService } from './progress.service';
import { ProgressStatsDto } from './dto/progress-stats.dto';

@ApiTags('progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('journey/:journeyId')
  @ApiOperation({ summary: 'Get derived streak and progress stats for a journey' })
  @ApiParam({ name: 'journeyId', description: 'Journey UUID' })
  @ApiResponse({
    status: 200,
    description: 'Derived progress and streak metrics',
    type: ProgressStatsDto,
  })
  async getJourneyProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('journeyId') journeyId: string,
  ): Promise<ProgressStatsDto> {
    return this.progressService.getJourneyProgress(user.userId, journeyId);
  }
}
