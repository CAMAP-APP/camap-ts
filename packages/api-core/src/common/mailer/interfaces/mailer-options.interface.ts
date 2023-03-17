import { Transport, TransportOptions } from 'nodemailer';
import * as JSONTransport from 'nodemailer/lib/json-transport';
import * as SendmailTransport from 'nodemailer/lib/sendmail-transport';
import * as SESTransport from 'nodemailer/lib/ses-transport';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as StreamTransport from 'nodemailer/lib/stream-transport';
import { TemplateAdapter } from './template-adapter.interface';

type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | JSONTransport
  | SESTransport
  | Transport
  | string;

export interface MailerOptions {
  defaults?: Options;
  transport?: TransportType;
  template?: {
    dir?: string;
    adapter?: TemplateAdapter;
    options?: { [name: string]: any };
  };
  options?: { [name: string]: any };
}
