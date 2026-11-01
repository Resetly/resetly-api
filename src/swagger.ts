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
    .addTag('auth', 'Authentication and session management')
    .addTag('habits', 'Habits management (user-scoped)')
    .addTag('journeys', 'Habit journeys and tracking milestones')
    .addTag('check-ins', 'Daily check-in logs')
    .addTag('progress', 'Derived streaks and transformation progress')
    .addTag('notifications', 'Push notification tokens')
    .addTag('account', 'Data privacy and account erasure')
    .build();

  const rawDocument = SwaggerModule.createDocument(app, config);
  return cleanupOpenApiDoc(rawDocument);
}
