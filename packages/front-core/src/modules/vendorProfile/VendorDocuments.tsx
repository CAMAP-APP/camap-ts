import DocumentList from "@components/DocumentList";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { Catalog, EntityFile, Group, useVendorDocumentsQuery } from "@gql";
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";


type EntityFileLike = Pick<EntityFile, "id" | "documentType" | "visibility" | "name" | "url">;
type GroupLike = Pick<Group, "id" | "name">;
type CatalogLike = Pick<Catalog, "id" | "name"> & { documents: EntityFileLike[], group: GroupLike };

function VendorDocuments({ vendorId }: { vendorId: number }) {

    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

    const { data: { vendor } = {}, loading, error } = useVendorDocumentsQuery({
        variables: { vendorId },
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgressBox />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">{error.message}</Alert>
        );
    }

    const groups = vendor?.activeCatalogs.reduce((groups, cat) => {
        if(cat.documents.length > 0){
            if(!groups.has(cat.group.id))
                groups.set(cat.group.id, { group: cat.group, catalogs: [cat] });
            else groups.get(cat.group.id)?.catalogs.push(cat);
        }
        return groups;
    }, new Map<number, { group: GroupLike, catalogs:CatalogLike[] }> )

    return (
        <>
            <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <DocumentList documents={vendor?.documents ?? []} />
                </Box>
                {Array.from(groups?.values() ?? []).map(({ group, catalogs }) => (
                    <Box key={group.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='h4'>{tVendor("inGroupGroupName", { groupName: group.name })}</Typography>
                        <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }}>
                            {catalogs.map((cat) => (
                                <Card key={cat.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 290 }}>
                                    <CardContent sx={{ height: 'auto', flexGrow: 1 }}>
                                        <Typography>{cat.name}</Typography>
                                        <DocumentList documents={cat.documents} />
                                        {cat.documents.length === 0 &&
                                            <Typography>{tVendor("noCatalogPublicFile")}</Typography>
                                        }
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
        </>
    );
}

export default VendorDocuments;