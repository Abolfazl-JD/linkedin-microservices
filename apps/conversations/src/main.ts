import { RmqService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ConversationsModule } from './conversations.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationsModule);
  const rmqService = app.get(RmqService)
  app.connectMicroservice(rmqService.getOptions("CONVERSATIONS", true))
  const configService = app.get(ConfigService)
  await app.startAllMicroservices()
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
