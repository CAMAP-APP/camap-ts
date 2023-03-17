import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
  ContextType,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const type = context.getType<ContextType & 'graphql'>();

    if (type === 'http') {
      return context.switchToHttp().getRequest().user;
    }
    if (type === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req.user;
    }

    if (!type) {
      throw new BadRequestException(`Unknow ${type} type`);
    }
    return undefined;
  },
);
