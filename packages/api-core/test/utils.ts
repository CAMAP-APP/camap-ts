import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ApolloError } from 'apollo-server-core';
import * as cookieParser from 'cookie-parser';
import { DocumentNode, print } from 'graphql';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from 'typeorm-transactional-cls-hooked';
import { AppModule } from '../src/app.module';
import TokenPayload from '../src/auth/tokenPayload.interface';
import { datasetGenerators, DatasetGenerators } from '../src/dev/dataset-generator';
import { UserEntity } from '../src/users/models/user.entity';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

type ApolloTestResponse<TData> = {
  data?: TData;
};

type StringOrAst = string | DocumentNode;

type ApolloTestQuery<TVariables = Record<string, any>> = {
  query: StringOrAst;
  mutation?: undefined;
  variables?: TVariables;
  operationName?: string;
};
type ApolloTestMutation<TVariables = Record<string, any>> = {
  mutation: StringOrAst;
  query?: undefined;
  variables?: TVariables;
  operationName?: string;
};

interface ApolloTestClient {
  query<TData = any, TVariables = Record<string, any>>(
    query: ApolloTestQuery<TVariables>,
  ): Promise<ApolloTestResponse<TData>>;
  mutate<TData = any, TVariables = Record<string, any>>(
    query: ApolloTestMutation<TVariables>,
  ): Promise<ApolloTestResponse<TData>>;
}

export interface TestContextHelper {
  app: INestApplication;
  moduleFixture: TestingModule;
  createApolloClient: (user?: UserEntity) => ApolloTestClient;
  signUser: (user: UserEntity) => string;
  getGenerators: () => Promise<DatasetGenerators>;
}

export const cleanDB = async ({ app }: TestContextHelper) => {
  const connection = app.get<Connection>(Connection);
  await connection.synchronize(true);
  // const queryRunner = connection.createQueryRunner();
  // await queryRunner.startTransaction();
  // try {
  //   await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
  //   await Promise.all([
  //     ...connection.entityMetadatas
  //       .map((e) => e.tableName)
  //       .map((tableName) => queryRunner.query(`TRUNCATE ${tableName}`)),
  //   ]);
  //   await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
  // } catch (error) {
  //   await queryRunner.rollbackTransaction();
  // }
};

export const initTestApp = async (resetDb = true): Promise<TestContextHelper> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Host'],
  });

  app.use(cookieParser());

  await app.init();

  app.use(cookieParser());

  const jwtService = moduleFixture.get<JwtService>(JwtService);

  const signUser = (user: UserEntity) => {
    const payload: TokenPayload = { email: user.email, id: user.id };
    return jwtService.sign(payload);
  };

  return {
    app,
    moduleFixture,
    createApolloClient: (user?: UserEntity) => {
      return createApolloClient({ app, signUser }, user);
    },
    signUser,
    getGenerators: () => datasetGenerators(app),
  };
};

export const closeTestApp = async ({ app }: Pick<TestContextHelper, 'app'>) => {
  await app.close();
};

export const createApolloClient = (
  { app, signUser }: Pick<TestContextHelper, 'app' | 'signUser'>,
  user?: UserEntity,
) => {
  const test = async <TData = any>({
    query,
    mutation,
    ...args
  }: ApolloTestQuery | ApolloTestMutation) => {
    const operation = query || mutation;

    const headers = {};
    if (user) {
      headers['Cookie'] = `Authentication=${
        user ? signUser(user) : ''
      };Refresh=blabla`;
    }

    try {
      const {
        body: { data, errors },
      } = await request(app.getHttpServer())
        .post('/graphql')
        .set(headers)
        .send({
          query: typeof operation === 'string' ? operation : print(operation),
          ...args,
        });
      return { data: data || undefined, errors: errors || undefined } as
        | { data: TData; errors: undefined }
        | { data: undefined; errors: ApolloError[] };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return {
    query: test,
    mutate: test,
  } as ApolloTestClient;
};

// export const createApolloClient = (
//   { gqlModule, signUser }: Pick<TestContextHelper, 'gqlModule' | 'signUser'>,
//   user?: UserEntity,
// ) => {
//   const { apolloServer } = gqlModule as any;
//   apolloServer.context = (...args: any) => {
//     return {
//       req: {
//         cookies: {
//           Authentication: user ? signUser(user) : '',
//           Refresh: 'blabla',
//         },
//       },
//     };
//   };
//   return createTestClient(apolloServer);
// };
