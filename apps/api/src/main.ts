import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load .env for local development. In production the variables are set by the
// hosting provider and there is no .env file.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validate every request body against its DTO; unknown fields are rejected.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Only the web app may call the API from a browser.
  app.enableCors({
    origin: process.env['WEB_ORIGIN'] ?? 'http://localhost:3000',
  });
  await app.listen(process.env['PORT'] ?? 3001);
}
await bootstrap();
