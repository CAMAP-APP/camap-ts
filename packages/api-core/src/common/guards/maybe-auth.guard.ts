import { Injectable } from '@nestjs/common';
import { GqlAuthAbstractGuard } from './gql-auth-abstract-guard';

@Injectable()
export class MaybeAuthGuard extends GqlAuthAbstractGuard(['jwt', 'void']) {}
