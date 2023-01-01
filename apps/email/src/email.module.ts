import { RmqModule, USERS_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailVerificationService } from './email-verification.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/email/.env'
    }),
    RmqModule.register({
      name: USERS_SERVICE,
      queue: "USERS"
    })
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailVerificationService],
})
export class EmailModule {}
