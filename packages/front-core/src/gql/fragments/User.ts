import gql from 'graphql-tag';

// eslint-disable-next-line import/prefer-default-export
export const UserFragment = gql`
  fragment User on User {
    id
    email
    firstName
    lastName
    address1
    address2
    zipCode
    city
    nationality
    countryOfResidence
    birthDate
    email2
    firstName2
    lastName2
    phone
    phone2
  }
`;
