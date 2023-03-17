import { createParamDecorator, ExecutionContext, BadRequestException, ContextType } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../users/models/user.entity';

export const IsAdmin = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const type = context.getType<ContextType & 'graphql'>();
  let user: UserEntity;

  if (type === 'http') {
    user = context.switchToHttp().getRequest().user;
  }
  if (type === 'graphql') {
    user = GqlExecutionContext.create(context).getContext().req.user;
  }

  if (!type) {
    throw new BadRequestException(`IsAdmin. Unknow ${type} type`);
  }

  return !user ? false : user.rights === 1;
});
