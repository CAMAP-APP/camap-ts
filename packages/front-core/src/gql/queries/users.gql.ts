import gql from 'graphql-tag';

// eslint-disable-next-line import/prefer-default-export
export const isGroupAdmin = gql`
  query isGroupAdmin($groupId: Int!) {
    isGroupAdmin(groupId: $groupId)
  }
`;
