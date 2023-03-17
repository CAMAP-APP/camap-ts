import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { DataLoaderInterceptor } from './common/interceptors/dataloader.interceptor';
import { DeadlockInterceptor } from './common/interceptors/dealock.interceptor';
import envSchema from './envSchema';
import { FilesModule } from './files/files.module';
import { GroupsModule } from './groups/groups.module';
import { MailsModule } from './mails/mails.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentsModule } from './payments/payments.module';
import { PlacesModule } from './places/places.module';
import { ShopModule } from './shop/shop.module';
import { ToolsModule } from './tools/tools.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';

const envFilePath = join(
  __dirname,
  `../../../.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`,
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      validate: (config: Record<string, unknown>) => {
        try {
          return envSchema.validateSync(config);
        } catch (error) {
          throw new Error(`Env error: ${error.errors.toString()}`);
        }
      },
    }),
    TypeOrmModule.forRoot(),
    GraphQLModule.forRoot({
      debug: process.env.NODE_ENV !== 'production',
      playground: process.env.NODE_ENV !== 'production',
      autoSchemaFile: join(process.cwd(), './src/schema.gql'),
      context: ({ req, res }) => ({ req, res }),
      uploads: false, // disable upload. see main.ts
      cors: false,
    } as any),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    GroupsModule,
    VendorsModule,
    ToolsModule,
    PaymentsModule,
    MessagesModule,
    MailsModule,
    PlacesModule,
    FilesModule,
    ShopModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DeadlockInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class AppModule {}
