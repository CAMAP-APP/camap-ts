import { INestApplicationContext, LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as chalk from 'chalk';
import { format } from 'date-fns';
import * as ora from 'ora';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from '../app.module';
import { VariableService } from '../tools/variable.service';
import { CliNestLogger } from './cli-logger';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

export const initNest = async (props?: {
  withDefaultLogger?: boolean;
  abortOnError?: boolean;
}) => {
  const { withDefaultLogger, abortOnError } = {
    withDefaultLogger: false,
    abortOnError: true,
    ...props,
  };

  const spinner = withDefaultLogger ? ora('Init nest').start() : undefined;

  const cliNestLogger = new CliNestLogger();
  let app: INestApplicationContext;

  try {
    let logger: LoggerService;
    if (!withDefaultLogger) logger = cliNestLogger;
    app = await NestFactory.createApplicationContext(AppModule, {
      logger,
      abortOnError,
    });
    const schedulerRegistry = app.get(SchedulerRegistry);

    // disable all cron
    const allCronJobs = schedulerRegistry.getCronJobs();
    allCronJobs.forEach((job) => job.stop());
  } catch (error) {
    spinner && spinner.fail();
    console.log('ERROR', chalk.red(cliNestLogger.errors[0].message));
    process.exit(1);
  }

  spinner && spinner.succeed();
  return app;
};

export const loadAdminProcess = async <T>(
  app: INestApplicationContext,
  name: string,
  defaultValue: T,
) => {
  const variable = await app.get(VariableService).findOneByKey(name);
  if (!variable) return defaultValue;
  return { ...defaultValue, ...JSON.parse(variable.value) };
};

export const saveAdminProcess = async <T>(
  app: INestApplicationContext,
  name: string,
  value: T,
) => {
  await app.get(VariableService).set(name, JSON.stringify(value));
};

export class ActionLogger {
  log(message: string) {
    console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${message}`);
  }
}
