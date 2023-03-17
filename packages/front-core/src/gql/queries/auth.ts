import gql from 'graphql-tag';
import { UserFragment } from '../fragments/User';

// eslint-disable-next-line import/prefer-default-export
export const Me = gql`
  query Me {
    me {
      ...User
    }
  }
  ${UserFragment}
`;
