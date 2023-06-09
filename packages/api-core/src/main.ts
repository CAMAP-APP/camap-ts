import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { URL_CUSTOM_HEADER } from 'camap-common';
import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import * as helmet from 'helmet';
import { resolve } from 'path';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from './app.module';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.set('trust proxy', true);

  app.use(graphqlUploadExpress({ maxFileSize: 1000000000, maxFiles: 10 }));

  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ limit: '25mb', extended: true, parameterLimit: 25000 }));

  const origin =
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONT_URL, process.env.CAMAP_HOST]
      : true;

  app.enableCors({
    origin,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Host',
      URL_CUSTOM_HEADER,
    ],
  });

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     disableErrorMessages: process.env.NODE_ENV === 'production',
  //     transform: true,
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );
  app.useStaticAssets(resolve(__dirname, '../../../public'));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const hostname = process.env.API_HOSTNAME;
  const port = process.env.API_PORT || process.env.PORT || 3001; // process.env.PORT is defined by Scalingo

  await app.listen(port, hostname);
  const url = await app.getUrl();

  // eslint-disable-next-line no-console
  console.log(
    `Server started on ${url}.
    Production: ${process.env.NODE_ENV === 'production'}`,
  );
}
bootstrap();
