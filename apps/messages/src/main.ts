import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MessagesModule } from './messages.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(MessagesModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  const configService = app.get(ConfigService)
  app.enableCors()
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
