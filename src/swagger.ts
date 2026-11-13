import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Resetly API')
    .setDescription(
      'Privacy-first, habit-transformation API. Streaks are dynamic and progress is never fabricated.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health and system diagnostics')
    .addTag('habits', 'Habits management (user-scoped)')
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config);
  return cleanupOpenApiDoc(rawDocument);
}
