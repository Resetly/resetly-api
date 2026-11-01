import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check API and database connectivity' })
  @ApiResponse({
    status: 200,
    description: 'System health status',
    type: HealthResponseDto,
  })
  async check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}
