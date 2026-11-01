import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../src/app.module';
import { AppConfigService } from '../src/config/config.service';
import { DRIZZLE_CLIENT, SQL_CLIENT } from '../src/database/database.module';

describe('Resetly API (e2e)', () => {
  let app: NestFastifyApplication;
  let configService: AppConfigService;
  let mockSql: any;
  let mockDb: any;

  beforeAll(async () => {
    mockSql = Object.assign(
      jest.fn().mockImplementation(() => Promise.resolve([{ '?column?': 1 }])),
      {
        end: jest.fn().mockResolvedValue(undefined),
        options: { parsers: {} },
      },
    );

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SQL_CLIENT)
      .useValue(mockSql)
      .overrideProvider(DRIZZLE_CLIENT)
      .useValue(mockDb)
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix('v1');

    configService = app.get(AppConfigService);

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /v1/health', () => {
    it('is public and accessible without authentication (200 OK)', async () => {
      const response = await request(app.getHttpServer()).get('/v1/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('GET /v1/habits', () => {
    it('is protected and returns 401 Unauthorized when unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/v1/habits').expect(401);

      expect(response.body).toMatchObject({
        statusCode: 401,
        error: 'Unauthorized',
      });
      expect(response.body.message).toContain('Authentication credentials are required');
      expect(response.body).toHaveProperty('requestId');
    });

    it('rejects invalid or forged bearer tokens with 401', async () => {
      await request(app.getHttpServer())
        .get('/v1/habits')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    it('accepts valid JWT access token and returns 200 OK', async () => {
      const validToken = jwt.sign(
        { sub: '00000000-0000-0000-0000-000000000001', email: 'test@resetly.app' },
        configService.jwtAccessSecret,
        { algorithm: 'HS256', expiresIn: '15m' },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/habits')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
