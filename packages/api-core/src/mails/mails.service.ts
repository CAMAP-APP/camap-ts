import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { subDays } from 'date-fns';
import * as inlineCSS from 'inline-css';
import * as path from 'path';
import { TwingEnvironment, TwingLoaderFilesystem, TwingTemplate } from 'twing';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { initTwig } from '../common/mailer/adapters/twing.adapter';
import { MAILS_TEMPLATE_DIR } from '../common/mailer/constants/mailer.constant';
import {
  Address,
  ISendMailOptions,
} from '../common/mailer/interfaces/send-mail-options.interface';
import { MailerService } from '../common/mailer/mailer.service';
import { CryptoService } from '../tools/crypto.service';
import { VariableService } from '../tools/variable.service';
import { UserEntity } from '../users/models/user.entity';
import { BufferedJsonMailEntity } from './models/buffered-json-mail.entity';

const REPLY_TO_HEADER_KEY = 'Reply-To';

type SenderType = Pick<UserEntity, 'firstName' | 'lastName' | 'email'> &
  Partial<Pick<UserEntity, 'id'>>;
type RecipientType = {
  email: string;
  firstName?: string;
  lastName?: string;
  id?: number;
};

@Injectable()
export class MailsService {
  private readonly logger = new Logger('MailService');
  private readonly loader: TwingLoaderFilesystem;
  private readonly twing: TwingEnvironment;
  private precompiledTemplates: Map<string, TwingTemplate> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @InjectRepository(BufferedJsonMailEntity)
    private readonly mailRepo: Repository<BufferedJsonMailEntity>,
    private readonly cryptoService: CryptoService,
    private readonly variableService: VariableService,
  ) {
    this.loader = new TwingLoaderFilesystem('mails/dist/');
    this.twing = new TwingEnvironment(this.loader);
    initTwig(this.twing);
  }

  // Actually send an email
  @Transactional()
  private async sendMail(options: ISendMailOptions) {
    const theme = await this.variableService.getTheme();
    const sendMailOptions: ISendMailOptions = { ...options };
    if (!sendMailOptions.from) {
      sendMailOptions.from = {
        address: theme.email.senderEmail,
        name: theme.name,
      };
    }

    if (process.env.NODE_ENV === 'test') return; // Skip mail sending in test env

    return this.mailerService.sendMail(sendMailOptions);
  }

  /**
   * Create a BufferedJsonMail
   */
  @Transactional()
  async createBufferedJsonMail(
    templateName: string,
    templateParameters: Record<string, any>,
    subject: string,
    recipients: RecipientType[],
    sender?: SenderType,
    replyToSenderHeader: boolean = false,
    attachments?: {
      filename: string;
      contentType: string;
      content: string;
      encoding: string;
      cid?: string;
    }[],
  ): Promise<BufferedJsonMailEntity> {
    if (process.env.NODE_ENV === 'test') return; // Skip creating mail in test env

    try {
      const theme = await this.variableService.getTheme();
      templateParameters.theme = theme;
      const templatedHtml = await this.renderTwing(templateName, templateParameters);

      let rawSender = null;
      if ('groupName' in templateParameters) {
        rawSender = JSON.stringify({
          name: templateParameters.groupName,
          userId: sender?.id,
          email: sender?.email,
        });
      } else if (sender) {
        rawSender = JSON.stringify({
          name: `${sender.firstName} ${sender.lastName}`,
          email: sender.email,
          userId: sender.id,
        });
      }

      return this.mailRepo.save({
        title: subject,
        htmlBody: templatedHtml,
        raw_sender: rawSender,
        raw_recipients: JSON.stringify(
          recipients.map((r) => {
            const recipient: { name?: string; email: string; userId?: number } = {
              email: r.email,
              userId: r.id,
            };
            if (r.firstName && r.lastName) {
              recipient.name = `${r.firstName} ${r.lastName}`;
            }
            return recipient;
          }),
        ),
        raw_headers: replyToSenderHeader
          ? JSON.stringify({
            [REPLY_TO_HEADER_KEY]: `${sender.firstName}<${sender.email}>`,
          })
          : JSON.stringify({}),
        cdate: new Date(),
        raw_attachments: JSON.stringify(attachments),
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // Get unsent emails (used for debugging)
  getUnsentMails = async () => {
    return this.mailRepo.find({
      select: ['id', 'cdate', 'tries', 'title', 'htmlBody', 'rawStatus'],
      where: { sdate: IsNull() },
      order: {
        cdate: 'DESC',
      },
    });
  };

  /**
   * CRONS
   */
  @Transactional()
  @Cron(CronExpression.EVERY_MINUTE)
  async sendEmailsFromBuffer() {
    // find not sent, oldest 100 mails
    const emails = await this.mailRepo.find({
      where: { sdate: IsNull(), tries: LessThan(30) },
      lock: { mode: 'pessimistic_write' },
      order: {
        cdate: 'ASC',
      },
      take: 100,
    });

    const emailsToDelete = emails.filter(
      (mail) => mail.recipients === null || mail.recipients.length === 0,
    );

    await Promise.all(
      emailsToDelete.map((mail) => {
        return this.mailRepo.delete(mail.id);
      }),
    );

    const emailsGroupByRecipientsBunch: BufferedJsonMailEntity[] = emails
      .filter((e) => emailsToDelete.findIndex((e2) => e2.id === e.id) === -1)
      .reduce((acc, mail) => {
        const recipients = [...mail.recipients];
        if (recipients.length > 99) {
          while (recipients.length > 0) {
            const bunchOfRecipients = recipients.splice(0, 99);
            acc.push({
              ...mail,
              sender: mail.sender,
              attachments: mail.attachments,
              headers: mail.headers,
              recipients: bunchOfRecipients,
            });
          }
        } else {
          acc.push(mail);
        }
        return acc;
      }, []);

    const theme = await this.variableService.getTheme();

    const sentOrFailedMails = await Promise.allSettled(
      emailsGroupByRecipientsBunch.map((mail: BufferedJsonMailEntity) => {
        let text: string;
        let html: string;
        let title: string;
        // decode UTF8, je comprends pas pourquoi je dois changer l'encodage à ce moment là...
        // UTF-decode may fail        
        /*try {
          text = decodeURIComponent(escape(mail.textBody));
          html = decodeURIComponent(escape(mail.htmlBody));
          title = decodeURIComponent(escape(mail.title));
        } catch (e) {*/
        text = mail.textBody;
        html = mail.htmlBody;
        title = mail.title;
        //}

        let from: Address = undefined;
        if (mail.sender) {
          from = {
            name: mail.sender.name,
            address: theme.email.senderEmail,
          };
        }

        try {
          return this.sendMail({
            bcc: mail.recipients.map((r) => r.email), // all recipients are in BCC
            subject: title,
            text,
            html,
            from,
            attachments: mail.attachments,
            headers: mail.headers,
          });
        } catch (error) {
          return Promise.reject(error);
        }
      }),
    );

    await Promise.all(
      sentOrFailedMails.map((sentOrFailed, index) => {
        const mail = emailsGroupByRecipientsBunch[index];
        if (sentOrFailed.status === 'fulfilled') {
          const res: {
            messageId: string;
            accepted: Array<any>;
            rejected: Array<any>;
          } = sentOrFailed.value;
          if (res.rejected.length > 0) {
            // some emails have been rejected
            this.logger.error(`Rejected:${JSON.stringify(res.rejected)}`);
            // remove accepted emails from recipients
            const acceptedEmails = res.accepted;
            return this.mailRepo.update(mail.id, {
              tries: mail.tries + 1,
              rawStatus: JSON.stringify(res),
              recipients: [...mail.recipients].filter(
                (r) => !acceptedEmails.includes(r.email),
              ),
            });
          } else {
            // email has been sent
            // mail.sdate = new Date();
            // mail.rawStatus = JSON.stringify(res);
            // return this.mailRepo.save(mail);
            return this.mailRepo.delete(mail.id);
          }
        } else if (sentOrFailed.status === 'rejected') {
          const stringifiedError = JSON.stringify(
            sentOrFailed.reason,
            Object.getOwnPropertyNames(sentOrFailed.reason),
          );
          this.logger.error(`Error:${stringifiedError}`);
          return this.mailRepo.update(mail.id, {
            tries: mail.tries + 1,
            rawStatus: stringifiedError,
          });
        }
      }),
    );

    // delete old mails
    const oldDate = subDays(new Date(), 10);
    await this.mailRepo.delete({ sdate: LessThan(oldDate) });
  }

  /**
   * HELPERS
   */
  getQuitGroupLink(groupId: number) {
    const hash = this.cryptoService.sha1(groupId.toString());
    return `${this.configService.get(
      'CAMAP_HOST',
    )}/user/quitGroupFromMessage/${groupId}/${hash}`;
  }

  async renderTwing(template: string, context: Record<string, any>) {
    const templateExt = path.extname(template) || '.twig';
    const templateName = path.basename(template, templateExt);

    const completeTemplateName = templateName + templateExt;
    if (!this.precompiledTemplates.has(completeTemplateName)) {
      this.precompiledTemplates.set(
        completeTemplateName,
        await this.twing.load(completeTemplateName),
      );
    }

    const rendered = await this.precompiledTemplates
      .get(completeTemplateName)
      .render({
        host: this.configService.get('CAMAP_HOST'),
        ...context,
      });
    return inlineCSS(rendered, {
      url: `file://${MAILS_TEMPLATE_DIR}/`,
      applyStyleTags: false,
      removeStyleTags: false,
    });
  }
}
