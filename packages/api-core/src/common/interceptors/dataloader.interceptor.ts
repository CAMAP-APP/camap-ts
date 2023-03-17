import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { NestDataLoader, NEST_LOADER_CONTEXT_KEY } from '../dataloader';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx = graphqlExecutionContext.getContext();

    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = {
        contextId: ContextIdFactory.create(),
        getLoader: (type: string): Promise<NestDataLoader<any, any>> => {
          if (ctx[type] === undefined) {
            try {
              ctx[type] = (async () => {
                return (
                  await this.moduleRef.resolve<NestDataLoader<any, any>>(
                    type,
                    ctx[NEST_LOADER_CONTEXT_KEY].contextId,
                    { strict: false },
                  )
                ).generateDataLoader();
              })();
            } catch (e) {
              throw new InternalServerErrorException(
                `The loader ${type} is not provided` + e,
              );
            }
          }
          return ctx[type];
        },
      };
    }
    return next.handle();
  }
}
