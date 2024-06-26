import gql from "graphql-tag";

export const getCatalogSubscriptions = gql`
query getCatalogSubscriptions($id: Int!) {
    catalog(id: $id) {
        id
        subscriptions {
            id
            user {
                id
                firstName
                lastName
            }
        }
    }
}
`