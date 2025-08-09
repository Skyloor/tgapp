import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: process.env.WEBAPP_ORIGIN?.split(',') ?? true, credentials: true });
  await app.listen(3000);
  console.log('API listening on http://localhost:3000');
}
bootstrap();
