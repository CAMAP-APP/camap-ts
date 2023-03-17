import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

export interface CliNestLog {
  time: number;
  message: any;
  context?: string;
}

export interface CliNestError extends CliNestLog {
  trace?: string;
}

export class CliNestLogger implements LoggerService {
  private _logs: CliNestLog[] = [];
  private _warns: CliNestLog[] = [];
  private _errors: CliNestError[] = [];

  static format(cliNestLog: CliNestLog | CliNestError) {
    console.log(chalk.red(cliNestLog.message));
  }

  log(message: any, context?: string) {
    this._logs.push({ time: new Date().getTime(), message, context });
  }

  warn(message: any, context?: string) {
    this._warns.push({ time: new Date().getTime(), message, context });
  }

  error(message: any, trace?: string, context?: string) {
    this._errors.push({ time: new Date().getTime(), message, trace, context });
  }

  debug(message: any, context?: string) {
    // console.log(message, context);
  }

  verbose(message: any, context?: string) {
    // console.log(message, context);
  }

  get logs() {
    return this._logs;
  }

  get warns() {
    return this._warns;
  }

  get errors() {
    return this._errors;
  }
}
