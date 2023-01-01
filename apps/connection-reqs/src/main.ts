import { RmqService } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ConnectionReqsModule } from './connection-reqs.module';

async function bootstrap() {
  const app = await NestFactory.create(ConnectionReqsModule);
  const rmqService = app.get(RmqService)
  app.connectMicroservice(rmqService.getOptions('CONNECTION_REQUESTS', true))
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }))
  const configService = app.get(ConfigService)
  await app.startAllMicroservices()
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
