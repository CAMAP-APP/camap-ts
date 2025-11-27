/* eslint-disable import/no-extraneous-dependencies */
import {
  ApolloError,
  ApolloProvider,
  DocumentNode,
  InMemoryCache,
} from '@apollo/client';
import { GraphQLError } from 'graphql';
import { createMockClient, RequestHandler } from 'mock-apollo-client';
import React from 'react';
import waait from 'waait';
import { inMemoryCacheConfig } from '../config/apollo.config';

export interface CamapApolloMockedProviderProps {
  children: React.ReactNode;
  defaultDelay?: number;
  requests?: MockedRequests;
  requestDelays?: { [key: string]: number };
  requestErrors?: { [key: string]: ReadonlyArray<GraphQLError> };
}

export interface MockedRequests {
  [key: string]: { query: DocumentNode; handler: RequestHandler };
}

export interface CamapMock {
  requests: MockedRequests;
  data: { [k: string]: any };
}

export const createCamapMockedClient = (
  requests: MockedRequests,
  defaultDelay: number,
  requestDelays?: { [key: string]: number },
  requestErrors?: { [key: string]: ReadonlyArray<GraphQLError> },
) => {
  const client = createMockClient({
    cache: new InMemoryCache({ ...inMemoryCacheConfig, addTypename: false }),
  });

  Object.keys(requests).forEach((key) => {
    client.setRequestHandler(requests[key].query, (async (...args) => {
      if (requestDelays && requestDelays[key]) await waait(requestDelays[key]);
      else await waait(defaultDelay);

      if (requestErrors && requestErrors[key]) {
        return Promise.reject(
          new ApolloError({
            graphQLErrors: requestErrors[key],
          }),
        );
      }
      return requests[key].handler(args);
    }) as RequestHandler);
  });

  return client;
};

const CamapApolloMockedProvider = ({
  children,
  defaultDelay = 500,
  requests = {},
  requestDelays,
  requestErrors,
}: CamapApolloMockedProviderProps) => {
  return (
    <ApolloProvider
      client={createCamapMockedClient(
        requests,
        defaultDelay,
        requestDelays,
        requestErrors,
      )}
    >
      {children}
    </ApolloProvider>
  );
};

export default CamapApolloMockedProvider;
