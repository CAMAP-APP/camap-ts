import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { withScalars } from 'apollo-link-scalars';
import { createUploadLink } from 'apollo-upload-client';
import { URL_CUSTOM_HEADER } from 'camap-common';
import { formatISO9075 } from 'date-fns';
import { buildClientSchema, IntrospectionQuery } from 'graphql';
import 'isomorphic-unfetch';
import { inMemoryCacheConfig } from '../config/apollo.config';
import introspection from '../gql/introspection.json';
import { getGraphqlUrl } from './runtimeCfg';

let globalApolloClient: ApolloClient<NormalizedCacheObject> | null = null;

const typesMap = {
  DateTime: {
    serialize: (parsed: Date | string) => {
      if (typeof parsed === 'string') {
        return parsed;
      }
      return formatISO9075(parsed);
    },
    parseValue: (raw: string | number | null): Date | null => {
      return raw ? new Date(raw) : null;
    },
  },
};

const customHeaderLink = new ApolloLink((operation, forward) => {
  // Add the current pathname to the query using a custom header
  operation.setContext(({ headers }: { headers: Record<string, string> }) => {
    return {
      headers: {
        [URL_CUSTOM_HEADER]: window.location.pathname,
        ...headers,
      },
    };
  });
  return forward(operation);
});

function createApolloClient(
  initialState: NormalizedCacheObject = {},
  options: { fetchOptions?: RequestInit; uri?: string } = {},
) {
  const httpLink = createUploadLink({
    // ⚠ process.env.FRONT_GRAPHQL_URL est résolu au build. On veut du runtime:
    uri: options.uri || getGraphqlUrl(),
    credentials: 'include',
    ...(options && options.fetchOptions ? options.fetchOptions : {}),
  });

  const schema = buildClientSchema(
    introspection as unknown as IntrospectionQuery,
  );

  const withScalarsLink = ApolloLink.from([
    withScalars({ schema, typesMap }),
    customHeaderLink,
    httpLink as any,
  ]);

  return new ApolloClient({
    // connectToDevTools: process.browser,
    ssrMode: typeof window === 'undefined',
    link: withScalarsLink,
    cache: new InMemoryCache(inMemoryCacheConfig).restore(initialState || {}),
  });
}

export default function initApolloClient(
  initialState?: NormalizedCacheObject,
  options: { fetchOptions?: RequestInit; uri?: string } = {},
) {
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, options);
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, options);
  }

  return globalApolloClient;
}
