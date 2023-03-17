import { GraphQLError } from 'graphql';

export const isCamapException = (graphQLError: GraphQLError) => {
  return (
    graphQLError.extensions &&
    graphQLError.extensions.exception &&
    graphQLError.extensions.exception.status === 500 &&
    graphQLError.extensions.exception.message === 'Camap Exception' &&
    graphQLError.extensions.exception.response
  );
};

export const findCamapException = (graphQLErrors: readonly GraphQLError[]) => {
  return graphQLErrors.find(isCamapException);
};

export const getCamapExceptionBody = ({ extensions }: GraphQLError) => {
  return extensions && extensions.exception && extensions.exception.response;
};
