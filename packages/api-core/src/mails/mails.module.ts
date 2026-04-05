import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwingAdapter } from '../common/mailer/adapters/twing.adapter';
import { MAILS_TEMPLATE_DIR } from '../common/mailer/constants/mailer.constant';
import { MailerOptions } from '../common/mailer/interfaces/mailer-options.interface';
import { MailerModule } from '../common/mailer/mailer.module';
import { ToolsModule } from '../tools/tools.module';
import { UsersModule } from '../users/users.module';
import { MailBridgeController } from './controllers/mail-bridge.controller';
import { MailsController } from './controllers/mails.controller';
import { MailsService } from './mails.service';
import { BufferedJsonMailEntity } from './models/buffered-json-mail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BufferedJsonMailEntity]),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const base: MailerOptions = {
          template: {
            dir: MAILS_TEMPLATE_DIR,
            adapter: new TwingAdapter(),
          },
        };

        const transport = configService.get<'smtp'>('MAILER_TRANSPORT');

        if (transport === 'smtp') {
          const smtpSecure = (process.env.SMTP_SECURE || '').trim().toLowerCase() === 'true';

          return {
            ...base,
            transport: {
              host: process.env.SMTP_HOST || 'localhost',
              port: parseInt(process.env.SMTP_PORT, 10) || 1025,
              secure: smtpSecure,
              ignoreTLS: false,
              requireTLS: !smtpSecure,
              auth: {
                user: process.env.SMTP_AUTH_USER,
                pass: process.env.SMTP_AUTH_PASS,
              },
            },
          };
        }

        return base;
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => ToolsModule),
  ],
  providers: [MailsService],
  controllers: [MailBridgeController, MailsController],
  exports: [MailsService],
})
export class MailsModule {}