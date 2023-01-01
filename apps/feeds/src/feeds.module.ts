import { DatabaseModule, RmqModule, USERS_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from './feed.entity';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/feeds/.env'
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: 'USERS'
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ Feed ])
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}
