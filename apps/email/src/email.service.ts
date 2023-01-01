import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
    private nodemailerTransport: Mail;

    constructor(
        private configService: ConfigService
    ) {
        this.nodemailerTransport = createTransport({
        service: 'gmail',
        auth: {
                user: this.configService.get<string>('ACCOUNT_EMAIL'),
                pass: this.configService.get<string>('ACCOUNT_PASS'),
            }
        })
    }
    
    sendMail(options: Mail.Options) {
        return this.nodemailerTransport.sendMail(options);
    }
}
