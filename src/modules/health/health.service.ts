import { Inject, Injectable, Logger } from '@nestjs/common';
import { Sql } from 'postgres';
import { SQL_CLIENT } from '../../database/database.module';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(@Inject(SQL_CLIENT) private readonly sql: Sql) {}

  async check(): Promise<HealthResponseDto> {
    let database: 'connected' | 'disconnected';

    try {
      await this.sql`SELECT 1`;
      database = 'connected';
    } catch (error) {
      this.logger.warn(
        `Database health check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      database = 'disconnected';
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
