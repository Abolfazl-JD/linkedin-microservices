import { DatabaseModule, EMAIL_SERVICE, RmqModule, USERS_SERVICE } from '@app/common';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/users/.env'
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    RmqModule.register({
      name: EMAIL_SERVICE,
      queue: "EMAIL"
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: "USERS"
    })
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    AuthService,
    UsersService,
  ]
})
export class UsersModule {}
