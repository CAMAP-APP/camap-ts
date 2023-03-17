import { applyDecorators } from '@nestjs/common';
import { Mutation, MutationOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { Transactional } from 'typeorm-transactional-cls-hooked';

export function TransactionalMutation(typeFunc: ReturnTypeFunc, options?: MutationOptions) {
  return applyDecorators(Transactional(), Mutation(typeFunc, options));
}
