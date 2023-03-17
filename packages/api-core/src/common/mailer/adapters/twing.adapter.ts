import * as inlineCSS from 'inline-css';
import * as path from 'path';
import { join } from 'path';
import {
  TwingEnvironment,
  TwingFilter,
  TwingLoaderFilesystem,
  TwingTemplate,
} from 'twing';
import { MailerOptions } from '../interfaces/mailer-options.interface';
import { ISendMailOptions } from '../interfaces/send-mail-options.interface';
import { TemplateAdapter } from '../interfaces/template-adapter.interface';
import MailMessage = require('nodemailer/lib/mailer/mail-message');

const i18next = require('i18next');
const SyncBackend = require('i18next-fs-backend');

i18next.use(SyncBackend).init({
  initImmediate: false,
  ns: ['translation'],
  // debug: true,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  backend: {
    loadPath: join(
      __dirname,
      '../../../../../../public/locales/{{lng}}/{{ns}}.json',
    ),
  },
});

export const initTwig = async (twing: TwingEnvironment) => {
  const trans = new TwingFilter(
    'trans',
    (key: string) => {
      const splited = key.split(':');
      const ns = key.includes(':') ? splited.shift() : 'translation';
      if (ns !== 'translation') {
        i18next.loadNamespaces(ns);
      }
      return Promise.resolve(i18next.t(`${ns}:${splited.join(':')}`));
    },
    [{ name: 'key' }],
  );
  twing.addFilter(trans);
};

export class TwingAdapter implements TemplateAdapter {
  private precompiledTemplates: Map<string, TwingTemplate> = new Map();

  compile(
    mail: MailMessage<any>,
    callback: (err?: any, body?: string) => any,
    options: MailerOptions,
  ): void {
    const mailData = mail.data as ISendMailOptions;
    const templateExt = path.extname(mailData.template) || '.twig';
    const templateName = path.basename(mailData.template, templateExt);
    const templateDir = options.template?.dir ?? path.dirname(mailData.template);
    const loader = new TwingLoaderFilesystem(templateDir);
    const twing = new TwingEnvironment(loader);

    initTwig(twing).then(() => {
      return this.renderTemplate(
        twing,
        templateName + templateExt,
        templateDir,
        mailData.context,
      )
        .then((html) => {
          mailData.html = html;

          return callback();
        })
        .catch(callback);
    });
  }

  private async renderTemplate(
    twing: TwingEnvironment,
    template: string,
    templateDir: string,
    context: Record<string, any>,
  ): Promise<string> {
    if (!this.precompiledTemplates.has(template))
      this.precompiledTemplates.set(template, await twing.load(template));

    const rendered = await this.precompiledTemplates.get(template).render(context);

    return inlineCSS(rendered, { url: `file://${templateDir}/` });
  }
}
