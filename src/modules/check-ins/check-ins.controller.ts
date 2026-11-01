import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { CheckInsService } from './check-ins.service';
import { CheckInResponseDto } from './dto/check-in-response.dto';

@ApiTags('check-ins')
@ApiBearerAuth()
@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Get('journey/:journeyId')
  @ApiOperation({ summary: 'Get check-ins for a journey (scoped to authenticated user)' })
  @ApiParam({ name: 'journeyId', description: 'Journey UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of check-ins for the journey',
    type: [CheckInResponseDto],
  })
  async getCheckIns(
    @CurrentUser() user: AuthenticatedUser,
    @Param('journeyId') journeyId: string,
  ): Promise<CheckInResponseDto[]> {
    return this.checkInsService.findByJourneyId(user.userId, journeyId);
  }
}
