import gql from 'graphql-tag';

/**
 * QUERIES
 */
export const initMessagingService = gql`
  query initMessagingService($id: Int!) {
    me {
      ...User
    }
    groupPreview(id: $id) {
      id
      name
    }
    getUserLists(groupId: $id) {
      type
      count
      data
    }
  }
`;

export const getLatestMessages = gql`
  query GetLatestMessages {
    getLatestMessages {
      date
      slateContent
      title
      attachments {
        ... on EmbeddedImageAttachment {
          cid
          content
        }
        ... on OtherAttachment {
          fileName
        }
      }
      group {
        name
      }
    }
  }
`;

export const ContractsUserLists = gql`
  query ContractsUserLists($groupId: Int!) {
    getContractsUserLists(groupId: $groupId) {
      count
      type
      data
    }
  }
`;

export const DistributionsUserLists = gql`
  query DistributionsUserLists($groupId: Int!) {
    getDistributionsUserLists(groupId: $groupId) {
      count
      type
      data
    }
  }
`;

export const getUserListInGroupByListType = gql`
  query getUserListInGroupByListType(
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
      email
      email2
    }
  }
`;

export const createMessage = gql`
  mutation createMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
    }
  }
`;

export const GetMessagesForGroup = gql`
  query GetMessagesForGroup($groupId: Int!) {
    getMessagesForGroup(groupId: $groupId) {
      id
      title
      date
    }
  }
`;

export const GetUserMessagesForGroup = gql`
  query GetUserMessagesForGroup($groupId: Int!) {
    getUserMessagesForGroup(groupId: $groupId) {
      id
      title
      date
    }
  }
`;

export const GetMessageById = gql`
  query GetMessageById($id: Int!) {
    message(id: $id) {
      id
      title
      date
      recipientListId
      sender {
        id
        firstName
        lastName
      }
      slateContent
      recipients
      attachments {
        ... on EmbeddedImageAttachment {
          cid
          content
        }
        ... on OtherAttachment {
          fileName
        }
      }
    }
  }
`;

export const getActiveCatalogsPictures = gql`
  query getActiveCatalogsPictures($groupId: Int!) {
    getActiveCatalogs(groupId: $groupId) {
      id
      vendor {
        id
        name
        image
      }
    }
  }
`;

export const getActiveVendors = gql`
  query getActiveVendorsFromGroup($groupId: Int!) {
    getActiveVendorsFromGroup(groupId: $groupId) {
      id
      name
      email
      id
    }
  }
`;
