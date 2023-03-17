import gql from 'graphql-tag';

// eslint-disable-next-line import/prefer-default-export
export const GroupPreview = gql`
  query GroupPreview($id: Int!) {
    groupPreview(id: $id) {
      id
      name
    }
  }
`;
