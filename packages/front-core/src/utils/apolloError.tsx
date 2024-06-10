import { GraphQLError } from 'graphql';

export const isANestException = ({ extensions }: GraphQLError) =>
  !!(extensions && (extensions.response ||extensions.exception));
