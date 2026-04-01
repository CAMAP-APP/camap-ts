import gql from 'graphql-tag';

export const getCatalogSubscriptions = gql`
  query getCatalogSubscriptions($id: Int!) {
    catalog(id: $id) {
      id
      type
      name
      subscriptions {
        id
        startDate,
        endDate,
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;
