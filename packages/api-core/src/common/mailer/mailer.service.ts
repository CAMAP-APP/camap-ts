import { Inject, Injectable, Optional } from '@nestjs/common';
import { get } from 'lodash';
import { SentMessageInfo, Transporter } from 'nodemailer';
import {
  MAILER_OPTIONS,
  MAILER_TRANSPORT_FACTORY,
} from './constants/mailer.constant';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { MailerTransportFactory as IMailerTransportFactory } from './interfaces/mailer-transport-factory.interface';
import { ISendMailOptions } from './interfaces/send-mail-options.interface';
import { TemplateAdapter } from './interfaces/template-adapter.interface';
import { MailerTransportFactory } from './mailer-transport.factory';

@Injectable()
export class MailerService {
  private transporter: Transporter;

  private initTemplateAdapter(
    templateAdapter: TemplateAdapter,
    transporter: Transporter,
  ): void {
    if (templateAdapter) {
      transporter.use('compile', (mail, callback) => {
        if (mail.data.html) {
          return callback();
        }

        return templateAdapter.compile(mail, callback, this.mailerOptions);
      });
    }
  }

  constructor(
    @Inject(MAILER_OPTIONS) private readonly mailerOptions: MailerOptions,
    @Optional()
    @Inject(MAILER_TRANSPORT_FACTORY)
    private readonly transportFactory: IMailerTransportFactory,
  ) {
    if (!transportFactory) {
      this.transportFactory = new MailerTransportFactory(mailerOptions);
    }

    /** Adapter setup **/
    const templateAdapter: TemplateAdapter = get(
      this.mailerOptions,
      'template.adapter',
    );

    /** Transporter setup **/
    if (mailerOptions.transport) {
      this.transporter = this.transportFactory.createTransport();
      this.initTemplateAdapter(templateAdapter, this.transporter);
    }

    if (!this.transporter) {
      throw new Error(
        'Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.',
      );
    }
  }

  public async sendMail(
    sendMailOptions: ISendMailOptions,
  ): Promise<SentMessageInfo> {
    if (this.transporter) {
      return await this.transporter.sendMail(sendMailOptions);
    } else {
      throw new ReferenceError(`Transporter object undefined`);
    }
  }
}
