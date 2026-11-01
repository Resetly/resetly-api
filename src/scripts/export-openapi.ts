import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';
import { createSwaggerDocument } from '../swagger';

async function exportOpenApi() {
  console.log('Bootstrapping application context for OpenAPI export...');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false,
  });

  app.setGlobalPrefix('v1');
  const document = createSwaggerDocument(app);

  const outputPath = path.resolve(process.cwd(), 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');

  console.log(`OpenAPI specification successfully exported to: ${outputPath}`);
  await app.close();
  process.exit(0);
}

exportOpenApi().catch((error) => {
  console.error('Failed to export OpenAPI specification:', error);
  process.exit(1);
});
