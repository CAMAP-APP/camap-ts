import { isANestException } from '@utils/apolloError';
import { GraphQLError } from 'graphql';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AlertError from '../AlertError';

export interface ApolloGqlErrorAlertProps {
  graphqlError: GraphQLError;
}

const extractResponseFromNestException = (gqlError: GraphQLError) => {
  if (!isANestException(gqlError))
    throw new Error(
      '[extractResponseFromNestException] invalid next exception',
    );
  const { code, response } = gqlError.extensions;

  if (typeof response === 'string') {
    return {
      statusCode: code,
      message: gqlError.message,
    };
  }

  return response;
};

const ApolloGqlErrorAlert = ({ graphqlError }: ApolloGqlErrorAlertProps) => {
  const { t: _t, i18n } = useTranslation('errors');
  const t = (key: string) => _t(`errors:${key}`);
  const exists = (key: string) => i18n.exists(`errors:${key}`);
  let message = t(`${graphqlError.extensions?.code || graphqlError.message}`);

  /** */
  if (isANestException(graphqlError)) {
    const response = extractResponseFromNestException(graphqlError);
    message = exists(`${response.message}`)
      ? t(`${response.message}`)
      : t(`${response.statusCode}`);
  }
  return <AlertError message={message} />;
};

export default ApolloGqlErrorAlert;
