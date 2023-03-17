import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { VariableNames, VariableService } from '../../tools/variable.service';

@Injectable()
export class BlackListGuard implements CanActivate {
  constructor(private readonly variablesService: VariableService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<ContextType & 'graphql'>();
    let request: Request;
    if (type === 'http') {
      request = context.switchToHttp().getRequest();
    }
    if (type === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    }
    const ip = request.ip;

    const blackListedIpsJSON = await this.variablesService.get(
      VariableNames.ipBlacklist,
    );
    if (blackListedIpsJSON) {
      const blackListedIps: string[] = JSON.parse(blackListedIpsJSON);
      if (
        blackListedIps.includes(ip) ||
        blackListedIps.includes(ip.split('::ffff:').pop())
      ) {
        return false;
      }
    }
    const userAgent = request.headers['user-agent'];
    if (userAgent.toLowerCase().indexOf('python') > -1) {
      return false;
    }

    return true;
  }
}
