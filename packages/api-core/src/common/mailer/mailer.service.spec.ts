import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailerMock from 'nodemailer-mock';
import {
  MAILER_OPTIONS,
  MAILER_TRANSPORT_FACTORY,
} from './constants/mailer.constant';
import { MailerOptions } from './interfaces/mailer-options.interface';
import { MailerTransportFactory } from './interfaces/mailer-transport-factory.interface';
import { MailerService } from './mailer.service';
import MailMessage = require('nodemailer/lib/mailer/mail-message');
import SMTPTransport = require('nodemailer/lib/smtp-transport');

/**
 * HELPERS
 */
// Setup a testing module and MailerService
async function getMailerServiceForOptions(
  options: MailerOptions,
): Promise<MailerService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      MailerService,
    ],
  }).compile();

  const service = module.get<MailerService>(MailerService);
  return service;
}

/**
 * Spying on the SMTPTransport's send() implementation
 */
function spyOnSmtpSend(onMail: (mail: MailMessage) => void) {
  return jest
    .spyOn(SMTPTransport.prototype, 'send')
    .mockImplementation(function (
      mail: MailMessage,
      callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void,
    ): void {
      onMail(mail);
      callback(null, {
        envelope: {
          from: mail.data.from as string,
          to: [mail.data.to as string],
        },
        messageId: 'ABCD',
        accepted: [],
        rejected: [],
        pending: [],
        response: 'ok',
      });
    });
}

// Setup a testing module and a MailerService with a custom Transport
async function getMailerServiceWithCustomTransport(
  options: MailerOptions,
): Promise<MailerService> {
  class TestTransportFactory implements MailerTransportFactory {
    createTransport() {
      return nodemailerMock.createTransport({ host: 'localhost', port: -100 });
    }
  }
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        name: MAILER_OPTIONS,
        provide: MAILER_OPTIONS,
        useValue: options,
      },
      {
        name: MAILER_TRANSPORT_FACTORY,
        provide: MAILER_TRANSPORT_FACTORY,
        useClass: TestTransportFactory,
      },
      MailerService,
    ],
  }).compile();
  await module.init();

  const service = module.get<MailerService>(MailerService);
  return service;
}

describe('MailerService', () => {
  it('should not be defined if a transport is not provided', async () => {
    await expect(getMailerServiceForOptions({})).rejects.toMatchInlineSnapshot(
      `[Error: Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance.]`,
    );
  });

  it('should accept a smtp transport string', async () => {
    const service = await getMailerServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept smtp transport options', async () => {
    const service = await getMailerServiceForOptions({
      transport: {
        secure: true,
        auth: {
          user: 'user@domain.com',
          pass: 'pass',
        },
        options: {
          host: 'smtp.domain.com',
        },
      },
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBeInstanceOf(SMTPTransport);
  });

  it('should accept a smtp transport instance', async () => {
    const transport = new SMTPTransport({});
    const service = await getMailerServiceForOptions({
      transport: transport,
    });

    expect(service).toBeDefined();
    expect((service as any).transporter.transporter).toBe(transport);
  });

  it('should send emails with nodemailer', async () => {
    let lastMail: MailMessage;
    const send = spyOnSmtpSend((mail: MailMessage) => {
      lastMail = mail;
    });

    const service = await getMailerServiceForOptions({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });

    await service.sendMail({
      from: 'user1@example.test',
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(send).toHaveBeenCalled();
    expect(lastMail.data.from).toBe('user1@example.test');
    expect(lastMail.data.to).toBe('user2@example.test');
    expect(lastMail.data.subject).toBe('Test');
    expect(lastMail.data.html).toBe('This is test.');
  });

  it('should use custom transport to send mail', async () => {
    const service = await getMailerServiceWithCustomTransport({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    });
    await service.sendMail({
      to: 'user2@example.test',
      subject: 'Test',
      html: 'This is test.',
    });

    expect(nodemailerMock.mock.getSentMail()).toHaveLength(1);
  });
});
