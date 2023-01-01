import { DatabaseModule, RmqModule, USERS_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionReq } from './connection-req.entity';
import { ConnectionReqsController } from './connection-reqs.controller';
import { ConnectionReqsService } from './connection-reqs.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/connection-reqs/.env'
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: 'USERS'
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ ConnectionReq ])
  ],
  controllers: [ConnectionReqsController],
  providers: [ConnectionReqsService],
})
export class ConnectionReqsModule {}
