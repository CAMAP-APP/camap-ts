import { ApolloError } from '@apollo/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AlertError from '../AlertError';
import ApolloGqlErrorAlert, {
  ApolloGqlErrorAlertProps,
} from './ApolloGqlErrorAlert';
import ApolloNetworkErrorAlert, {
  ApolloNetworkErrorAlertProps,
} from './ApolloNetworkErrorAlert';

export interface ApolloErrorAlertProps {
  error: ApolloError;
  NetworkErrorAlertComponent?: React.ComponentType<ApolloNetworkErrorAlertProps>;
  GqlErrorAlertComponent?: React.ComponentType<ApolloGqlErrorAlertProps>;
}
const ApolloErrorAlert = ({
  error: { networkError, graphQLErrors, message },
  NetworkErrorAlertComponent,
  GqlErrorAlertComponent,
}: ApolloErrorAlertProps) => {
  const { t } = useTranslation('errors');

  if (networkError) {
    if (NetworkErrorAlertComponent)
      return <NetworkErrorAlertComponent networkError={networkError} />;
    return <ApolloNetworkErrorAlert networkError={networkError} />;
  }

  if (graphQLErrors && graphQLErrors.length > 0) {
    return (
      <>
        {graphQLErrors
          .map((graphQLError, index) => ({ id: index, graphQLError }))
          .map(({ id, graphQLError }) =>
            GqlErrorAlertComponent ? (
              <GqlErrorAlertComponent key={id} graphqlError={graphQLError} />
            ) : (
              <ApolloGqlErrorAlert key={id} graphqlError={graphQLError} />
            ),
          )}
      </>
    );
  }

  return <AlertError message={t(message)} />;
};

export default ApolloErrorAlert;
