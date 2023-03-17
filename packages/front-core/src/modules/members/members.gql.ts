import gql from 'graphql-tag';

/**
 * QUERIES
 */

export const initMembers = gql`
  query initMembers($groupId: Int!) {
    me {
      ...User
    }
    groupPreviewMembers(id: $groupId) {
      membershipFee
      hasMembership
    }
    getUserLists(groupId: $groupId) {
      type
      count
      data
    }
  }
`;

export const getMembersOfGroupByListType = gql`
  query getMembersOfGroupByListType(
    $listType: String!
    $groupId: Int!
    $data: String
  ) {
    getUserListInGroupByListType(
      listType: $listType
      groupId: $groupId
      data: $data
    ) {
      id
      firstName
      lastName
      firstName2
      lastName2
      city
      zipCode
      address1
      address2
      email
      phone
      email2
      phone2
    }
  }
`;

export const getWaitingListsOfGroup = gql`
  query getWaitingListsOfGroup($groupId: Int!) {
    getWaitingListsOfGroup(groupId: $groupId) {
      user {
        id
        firstName
        lastName
        firstName2
        lastName2
        email
        phone
      }
      date
      message
    }
  }
`;

export const moveBackToWaitingList = gql`
  mutation moveBackToWaitingList(
    $userIds: [Int!]!
    $groupId: Int!
    $message: String!
  ) {
    moveBackToWaitingList(
      userIds: $userIds
      groupId: $groupId
      message: $message
    ) {
      success {
        amapId
        userId
      }
      errors {
        userId
        message
      }
    }
  }
`;

export const removeUsersFromGroup = gql`
  mutation removeUsersFromGroup($userIds: [Int!]!, $groupId: Int!) {
    removeUsersFromGroup(userIds: $userIds, groupId: $groupId) {
      success {
        groupId
        userId
      }
      errors {
        userId
        message
      }
    }
  }
`;

export const approveRequest = gql`
  mutation approveRequest($userId: Int!, $groupId: Int!) {
    approveRequest(userId: $userId, groupId: $groupId) {
      userId
    }
  }
`;

export const cancelRequest = gql`
  mutation cancelRequest($userId: Int!, $groupId: Int!) {
    cancelRequest(userId: $userId, groupId: $groupId) {
      userId
    }
  }
`;

export const createMemberships = gql`
  mutation createMemberships($input: CreateMembershipsInput!) {
    createMemberships(input: $input) {
      success {
        date
        amount
      }
      errors {
        userId
        message
      }
    }
  }
`;

export const getUsersFromEmails = gql`
  query getUsersFromEmails($emails: [String!]!) {
    getUsersFromEmails(emails: $emails) {
      id
      email
      email2
    }
  }
`;

export const sendInvitesToNewMembers = gql`
  mutation sendInvitesToNewMembers(
    $groupId: Int!
    $withAccounts: [Int!]!
    $withoutAccounts: [SendInvitesToNewMembersInput!]!
  ) {
    sendInvitesToNewMembers(
      groupId: $groupId
      withAccounts: $withAccounts
      withoutAccounts: $withoutAccounts
    ) {
      withAccounts
      withoutAccounts
    }
  }
`;

export const importAndCreateMembers = gql`
  mutation importAndCreateMembers(
    $groupId: Int!
    $withAccounts: [Int!]!
    $withoutAccounts: [SendInvitesToNewMembersInput!]!
  ) {
    importAndCreateMembers(
      groupId: $groupId
      withAccounts: $withAccounts
      withoutAccounts: $withoutAccounts
    ) {
      withAccounts
      withoutAccounts
    }
  }
`;
