import MailMessage = require('nodemailer/lib/mailer/mail-message');
import { MailerOptions } from './mailer-options.interface';

export interface TemplateAdapter {
  compile(
    mail: MailMessage<any>,
    callback: (err?: any, body?: string) => any,
    options: MailerOptions,
  ): void;
}
