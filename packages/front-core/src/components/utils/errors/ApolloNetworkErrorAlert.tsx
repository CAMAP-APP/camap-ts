import { ServerError, ServerParseError } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AlertError from '../AlertError';

export interface ApolloNetworkErrorAlertProps {
  networkError: Error | ServerParseError | ServerError;
}
const ApolloNetworkErrorAlert = ({ networkError }: ApolloNetworkErrorAlertProps) => {
  const { t: _t, i18n } = useTranslation('errors');
  const t = (key: string) => _t(`errors:${key}`);
  const exists = (key: string) => i18n.exists(`errors:${key}`);

  const statusCode = 'statusCode' in networkError ? networkError.statusCode : undefined;
  const message = statusCode && exists(`${statusCode}`) ? t(`${statusCode}`) : t(networkError.message);

  return <AlertError message={message} />;
};

export default ApolloNetworkErrorAlert;
