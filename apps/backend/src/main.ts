import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // <-- Import Swagger tools

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // --- Swagger (OpenAPI) Documentation Setup ---
  const config = new DocumentBuilder()
    .setTitle('Yosell API')
    .setDescription('The official API for the Yosell platform.')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document , {
    customSiteTitle: 'Yosell API docs',
    customfavIcon: 'https://unpkg.com/swagger-ui-dist@latest/favicon-32x32.png',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@latest/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@latest/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: [
      'https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css',
      'https://unpkg.com/swagger-ui-dist@latest/swagger-ui-standalone-preset.css',
      'https://unpkg.com/swagger-ui-dist@latest/swagger-ui.css',
    ],
    swaggerOptions: {
      tagsSorter: 'alpha', // Sorts tags alphabetically
      operationsSorter: 'alpha', // Sorts operations alphabetically by path
    },
  }); // <-- Serve docs at /api/docs
  // ---------------------------------------------

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
