import gql from 'graphql-tag';

// eslint-disable-next-line import/prefer-default-export
export const PLACE_QUERY = gql`
  query place($id: Int!) {
    place(id: $id) {
      id
      name
      address1
      address2
      city
      zipCode
      lat
      lng
    }
  }
`;
