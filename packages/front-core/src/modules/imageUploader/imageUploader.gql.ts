import gql from 'graphql-tag';

export const setProductImage = gql`
  mutation setProductImage(
    $productId: Int!
    $base64EncodedImage: String!
    $mimeType: String!
    $fileName: String!
    $maxWidth: Int!
  ) {
    setProductImage(
      productId: $productId
      base64EncodedImage: $base64EncodedImage
      mimeType: $mimeType
      fileName: $fileName
      maxWidth: $maxWidth
    ) {
      id
    }
  }
`;

export const setGroupImage = gql`
  mutation setGroupImage(
    $groupId: Int!
    $base64EncodedImage: String!
    $mimeType: String!
    $fileName: String!
    $maxWidth: Int!
  ) {
    setGroupImage(
      groupId: $groupId
      base64EncodedImage: $base64EncodedImage
      mimeType: $mimeType
      fileName: $fileName
      maxWidth: $maxWidth
    ) {
      id
    }
  }
`;

export const setVendorImage = gql`
  mutation setVendorImage(
    $vendorId: Int!
    $base64EncodedImage: String!
    $mimeType: String!
    $fileName: String!
    $maxWidth: Int!
  ) {
    setVendorImage(
      vendorId: $vendorId
      base64EncodedImage: $base64EncodedImage
      mimeType: $mimeType
      fileName: $fileName
      maxWidth: $maxWidth
    ) {
      id
    }
  }
`;
