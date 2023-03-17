import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const UserIp = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = GqlExecutionContext.create(context).getContext().req as Request;
    let ip = request.headers['X-Real-Ip'];
    if (!ip) ip = request.ip;

    return ip;
  },
);
