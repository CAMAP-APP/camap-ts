import { GraphQLError } from 'graphql';

export const isCamapException = (graphQLError: GraphQLError) => {
  return (
    graphQLError.extensions &&
    graphQLError.extensions.exception &&
    typeof graphQLError.extensions.exception == 'object' &&
    'status' in graphQLError.extensions.exception && graphQLError.extensions.exception.status === 500 &&
    'message' in graphQLError.extensions.exception && graphQLError.extensions.exception.message === 'Camap Exception' &&
    'response' in graphQLError.extensions.exception && graphQLError.extensions.exception.response
  );
};

export const findCamapException = (graphQLErrors: readonly GraphQLError[]) => {
  return graphQLErrors.find(isCamapException);
};

export const getCamapExceptionBody = ({ extensions }: GraphQLError) => {
  return extensions &&
    extensions.exception &&
    typeof extensions.exception == 'object' &&
    ('response' in extensions.exception) &&
    extensions.exception.response;
};
