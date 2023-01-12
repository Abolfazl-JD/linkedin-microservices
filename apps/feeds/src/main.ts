import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FeedsModule } from './feeds.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(FeedsModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  app.use(cookieParser())
  const configService = app.get(ConfigService)
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
