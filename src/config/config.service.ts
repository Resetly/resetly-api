import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get corsOrigins(): string[] {
    const raw = this.configService.get('CORS_ORIGINS', { infer: true });
    return raw
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  get jwtAccessSecret(): string {
    return this.configService.get('JWT_ACCESS_SECRET', { infer: true });
  }

  get jwtAccessTtl(): string {
    return this.configService.get('JWT_ACCESS_TTL', { infer: true });
  }

  get logLevel(): Env['LOG_LEVEL'] {
    return this.configService.get('LOG_LEVEL', { infer: true });
  }

  get expoAccessToken(): string | undefined {
    return this.configService.get('EXPO_ACCESS_TOKEN', { infer: true });
  }
}
