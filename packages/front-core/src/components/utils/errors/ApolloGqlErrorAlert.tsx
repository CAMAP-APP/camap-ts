import { isANestException } from '@utils/apolloError';
import { useTranslation } from 'react-i18next';
import AlertError from '../AlertError';
import {GraphQLErrorExtensions, GraphQLFormattedError} from "graphql/error/GraphQLError";

export interface ApolloGqlErrorAlertProps {
  graphqlError: GraphQLFormattedError;
}

type StandardError = {statusCode:number, message:string, options?:{[key:string]:string}}

const extractResponseFromNestException = (gqlError: GraphQLFormattedError) : StandardError => {
  if (!isANestException(gqlError))
    throw new Error(
      '[extractResponseFromNestException] invalid next exception',
    );

  let extensions = gqlError.extensions as {response: StandardError | string | null, statusCode: number, exception: {response: StandardError}};
  let response = extensions.response;
  if (extensions.response == null && extensions.exception != null) {
    response = extensions.exception.response;
    response.statusCode = gqlError.extensions?.code as number
  }

  if (typeof response === 'string') {
    return {
      statusCode: gqlError.extensions?.code as number,
      message: gqlError.message,
    };
  }

  return response as StandardError;
};

const ApolloGqlErrorAlert = ({graphqlError}: ApolloGqlErrorAlertProps) => {
  const {t: _t, i18n} = useTranslation('errors');
  const t = (key: string, extensions?: GraphQLErrorExtensions) => _t(`errors:${key}`, extensions);
  const exists = (key: string) => i18n.exists(`errors:${key}`);
  let message = graphqlError.message || t(`${graphqlError.extensions?.code}`);
  /** */
  if (isANestException(graphqlError)) {
    const response = extractResponseFromNestException(graphqlError);
    message = exists(`${response.message}`)
      ? t(`${response.message}`, response.options)
      : (!!response.message ? response.message : t(`${response.statusCode}`));
  }
  return <AlertError message={message}/>;
};

export default ApolloGqlErrorAlert;
