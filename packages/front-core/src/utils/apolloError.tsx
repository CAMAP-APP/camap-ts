import { GraphQLFormattedError } from 'graphql';

export function isANestException({ extensions }: GraphQLFormattedError) {
  if (extensions == null) return false;
  // search response
  if (extensions.response != null) return true;
  // search exception.response
  if (extensions.exception == null) return false;
  return (extensions.exception as { response: {} | undefined }).response != null;
}