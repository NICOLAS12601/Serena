import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

// Load .env for local development. In production the variables are set by the
// hosting provider and there is no .env file.
try {
  process.loadEnvFile();
} catch {
  // no .env file
}

async function bootstrap() {
  // Without the shared key the API would serve anyone who finds its address
  // (InternalKeyGuard). Better not to start than to run unprotected.
  if (
    process.env['NODE_ENV'] === 'production' &&
    !process.env['INTERNAL_API_KEY']
  ) {
    throw new Error('INTERNAL_API_KEY is required in production');
  }
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Every request reaches the API through proxies (the web's /api rewrite and
  // the hosting's load balancer), so req.ip would be the last proxy's address
  // and the rate limits would be shared by all visitors. TRUST_PROXY = how many
  // proxies sit in front of the API; Express then takes the visitor's IP from
  // X-Forwarded-For. Only the last N entries are trusted: anything a visitor
  // writes in that header themselves is ignored. Unset locally (no proxy).
  const trustProxy = Number(process.env['TRUST_PROXY'] ?? 0);
  if (trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  }
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
