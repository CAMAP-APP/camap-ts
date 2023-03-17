import { InMemoryCacheConfig } from '@apollo/client/core';

// eslint-disable-next-line import/prefer-default-export
export const inMemoryCacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    GroupPreviewMap: { keyFields: ['id', 'placeId'] },
  },
};
