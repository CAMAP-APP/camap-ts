import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DataLoaderInterceptor } from '../interceptors/dataloader.interceptor';

const NEST_LOADER_CONTEXT_KEY: string = 'NEST_LOADER_CONTEXT_KEY';

export const Loader = createParamDecorator(
  async (data: any, context: ExecutionContext & { [key: string]: any }) => {
    const ctx: any = GqlExecutionContext.create(context).getContext();
    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
            You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
          `);
    }
    return await ctx[NEST_LOADER_CONTEXT_KEY].getLoader(data);
  },
);
