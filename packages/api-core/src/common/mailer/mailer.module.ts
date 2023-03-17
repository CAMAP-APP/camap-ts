import { DynamicModule, Module } from '@nestjs/common';
import { MailerAsyncOptions } from './interfaces/mailer-async-options.interface';
import { MailerCoreModule } from './mailer-core.module';

@Module({})
export class MailerModule {
  public static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: [MailerCoreModule.forRootAsync(options)],
    };
  }
}
