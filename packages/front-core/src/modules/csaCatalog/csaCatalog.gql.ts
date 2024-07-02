import gql from 'graphql-tag';

export const getCatalogSubscriptions = gql`
  query getCatalogSubscriptions($id: Int!) {
    catalog(id: $id) {
      id
      type
      name
      subscriptions {
        id
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
