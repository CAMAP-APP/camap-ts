import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
  ContextType,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../users/models/user.entity';

export const MaybeCurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const type = context.getType<ContextType & 'graphql'>();

    let user: UserEntity | -1; // -1 for void.strategy
    if (type === 'http') {
      user = context.switchToHttp().getRequest().user;
    } else if (type === 'graphql') {
      user = GqlExecutionContext.create(context).getContext().req.user;
    }

    if (!type) {
      throw new BadRequestException(`Unknow ${type} type`);
    }

    return user === -1 ? undefined : user;
  },
);
