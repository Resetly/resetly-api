import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { createSwaggerDocument } from './swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 100 * 1024, // 100 KB body limit
    requestIdHeader: 'x-request-id',
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter);

  const configService = app.get(AppConfigService);

  // Security Headers via Helmet
  await app.register(helmet as any, {
    contentSecurityPolicy: configService.isProduction,
  });

  // CORS Configuration
  const allowedOrigins = configService.corsOrigins;
  await app.register(cors as any, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
      // Allow non-browser requests (e.g. mobile apps, server-to-server, curl)
      if (!origin) {
        cb(null, true);
        return;
      }

      if (configService.isProduction) {
        if (allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error('Blocked by CORS policy'), false);
        }
      } else {
        // In development, allow localhost origins or explicitly configured origins
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost') ||
          origin.startsWith('http://127.0.0.1')
        ) {
          cb(null, true);
        } else {
          cb(null, true);
        }
      }
    },
    credentials: true,
  });

  // Global Prefix: /v1
  app.setGlobalPrefix('v1');

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Global validation pipe for all incoming requests (no endpoint accepts unvalidated input)
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger UI available at /docs in non-production environments
  if (!configService.isProduction) {
    const document = createSwaggerDocument(app);
    SwaggerModule.setup('docs', app, document);
    logger.log(`Swagger documentation available at /docs`);
  }

  const port = configService.port;
  await app.listen(port, '0.0.0.0');
  logger.log(`Resetly API is running on http://localhost:${port}/v1`);
}

bootstrap();
