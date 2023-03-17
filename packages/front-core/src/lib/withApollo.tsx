import { ApolloProvider } from '@apollo/client';
import React from 'react';
import initApolloClient from './initApollo';

const apolloClient = initApolloClient(
  {},
  { fetchOptions: { mode: 'cors', credentials: 'include' } },
);

const withApollo = <T extends object>(Wrapped: React.ComponentType<T>) => {
  const Wrapper = (props: T) => {
    /** */
    return (
      <ApolloProvider client={apolloClient}>
        <Wrapped {...props} />
      </ApolloProvider>
    );
  };

  return Wrapper;
};

export default withApollo;
