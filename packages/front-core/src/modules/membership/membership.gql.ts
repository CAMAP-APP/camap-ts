import gql from 'graphql-tag';

export const getUserMemberships = gql`
  query getUserMemberships($userId: Int!, $groupId: Int!) {
    getUserMemberships(userId: $userId, groupId: $groupId) {
      year
      name
      amount
      date
    }
  }
`;

export const getMembershipFormData = gql`
  query getMembershipFormData($userId: Int!, $groupId: Int!) {
    getMembershipFormData(userId: $userId, groupId: $groupId) {
      availableYears {
        name
        id
      }
      membershipFee
      distributions {
        id
        distribStartDate
      }
    }
  }
`;

export const createMembership = gql`
  mutation createMembership($input: CreateMembershipInput!) {
    createMembership(input: $input) {
      date
      amount
    }
  }
`;

export const deleteMembership = gql`
  mutation deleteMembership($userId: Int!, $groupId: Int!, $year: Int!) {
    deleteMembership(userId: $userId, groupId: $groupId, year: $year)
  }
`;
