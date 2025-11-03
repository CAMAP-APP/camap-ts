import { Catalog, Group, Vendor } from "@gql";

type Stub<T extends { __typename?: string, id: string | number }> = {
    __typename: T["__typename"],
    id: T["__typename"]
};

const useEntityUploadRequest = (
    entity: Stub<Vendor | Group | Catalog>
) => {



}

function DocumentUploader(props: {
    entity: Stub<Vendor | Group | Catalog>
}) {

    return <></>

}

export default DocumentUploader;