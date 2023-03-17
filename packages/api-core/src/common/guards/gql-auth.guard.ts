import { Injectable } from '@nestjs/common';
import { GqlAuthAbstractGuard } from './gql-auth-abstract-guard';

@Injectable()
export class GqlAuthGuard extends GqlAuthAbstractGuard('jwt') {}
