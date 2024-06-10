import { isANestException } from '@utils/apolloError';
import { GraphQLError } from 'graphql';
import { useTranslation } from 'react-i18next';
import AlertError from '../AlertError';
import {GraphQLErrorExtensions} from "graphql/error/GraphQLError";

export interface ApolloGqlErrorAlertProps {
  graphqlError: GraphQLError;
}

type StandardError = {statusCode:number, message:string, options?:{[key:string]:string}}

const extractResponseFromNestException = (gqlError: GraphQLError) : StandardError => {
  if (!isANestException(gqlError))
    throw new Error(
      '[extractResponseFromNestException] invalid next exception',
    );

  let extensions = gqlError.extensions as {response: StandardError | string | null, statusCode: number, exception: {response: StandardError}};
  let response = extensions.response;
  if (extensions.response == null && extensions.exception != null) {
    response = extensions.exception.response;
    response.statusCode = gqlError.extensions.code as number
  }

  if (typeof response === 'string') {
    return {
      statusCode: gqlError.extensions.code as number,
      message: gqlError.message,
    };
  }

  return response as StandardError;
};

const ApolloGqlErrorAlert = ({graphqlError}: ApolloGqlErrorAlertProps) => {
  const {t: _t, i18n} = useTranslation('errors');
  const t = (key: string, extensions?: GraphQLErrorExtensions) => _t(`errors:${key}`, extensions);
  const exists = (key: string) => i18n.exists(`errors:${key}`);
  let message = t(`${graphqlError.extensions?.code || graphqlError.message}`);
  /** */
  if (isANestException(graphqlError)) {
    const response = extractResponseFromNestException(graphqlError);
    message = exists(`${response.message}`)
      ? t(`${response.message}`, response.options)
      : t(`${response.statusCode}`);
  }
  return <AlertError message={message}/>;
};

export default ApolloGqlErrorAlert;
