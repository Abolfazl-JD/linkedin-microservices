import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { RmqService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const rmqService = app.get(RmqService)
  app.connectMicroservice(rmqService.getOptions('USERS', true))
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  const configService = app.get(ConfigService)
  await app.startAllMicroservices()
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
