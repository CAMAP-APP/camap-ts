import DocumentList from "@components/DocumentList";
import DocumentUploader from "@components/DocumentUploader";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { Catalog, EntityFile, Group, useVendorActiveCatalogsQuery, useVendorDocumentsQuery, Vendor } from "@gql";
import { Close as CloseIcon } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogTitle, IconButton, Typography } from "@mui/material";
import { Stub } from "@utils/gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";


type EntityFileLike = Pick<EntityFile, "id" | "documentType" | "visibility" | "name" | "url">;
type GroupLike = Pick<Group, "id" | "name">;
type CatalogLike = Pick<Catalog, "id" | "name"> & { group: GroupLike };

function VendorEditDocuments({ vendorId }: { vendorId: number }) {

    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

    const { data: { vendor: vendorDocuments } = {}, loading: loadingDocuments, error: errorDocuments, refetch: refetchDocuments } = useVendorDocumentsQuery({
        variables: { vendorId },
    });
    const { data: { vendor: vendorCatalogs } = {}, loading: loadingCatalogs, error: errorCatalogs } = useVendorActiveCatalogsQuery({
        variables: { vendorId },
    })


    const [uploadToEntity, setUploadToEntity] = useState<Stub<Vendor> | Group | Catalog | null>(null);
    const [uploadError, setUploadError] = useState<Error | null>(null);

    if (loadingDocuments || loadingCatalogs) {
        return <CircularProgressBox />;
    }

    if (errorDocuments)
        return <Alert severity="error">{errorDocuments.message}</Alert>;
    if (errorCatalogs)
        return <Alert severity="error">{errorCatalogs.message}</Alert>;
        

    const groups = vendorCatalogs?.activeCatalogs.reduce((groups, cat) => {
        if(!groups.has(cat.group.id))
            groups.set(cat.group.id, { group: cat.group, catalogs: [{...cat, documents: []}] });
        else groups.get(cat.group.id)?.catalogs.push({...cat, documents:[]});
        return groups;
    }, new Map<number, { group: GroupLike, catalogs:(CatalogLike & {documents: EntityFileLike[]})[] }> )!;
    vendorDocuments?.activeCatalogs.forEach(cat => {
        if(!groups.has(cat.group.id))
            groups.set(cat.group.id, { group: cat.group, catalogs: [cat] });
        else {
            const {catalogs} = groups.get(cat.group.id)!;
            const c = catalogs.find(c => c.id === cat.id);
            if(c) c.documents.push(...cat.documents);
            else catalogs.push(cat);
        }
    })

    const uploadToEntityName = !!uploadToEntity
    ? uploadToEntity.__typename === "Vendor"
        ? tVendor("defaultVendorName")
        : (uploadToEntity as Group | Catalog).name
    : ''

    return (
        <>
            <Box sx={{ paddingBottom: 3 }}>
                {vendorDocuments && <DocumentList documents={vendorDocuments?.documents} editable onDelete={refetchDocuments} />}
                {vendorDocuments?.documents.length === 0 &&
                    <Typography>{tVendor("noVendorPublicFile")}</Typography>
                }
                {!!vendorDocuments &&
                    <Button variant="contained" onClick={() => setUploadToEntity(vendorDocuments)}>{tVendor("uploadFile")}</Button>
                }
            </Box>
            {Array.from(groups?.values() ?? []).map(({ group, catalogs }) => (
                <Box key={group.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: "100%" }}>
                    <Typography variant='h4'>{tVendor("inGroupGroupName", { groupName: group.name })}</Typography>
                    <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }}>
                        {catalogs.map((cat) => (
                            <Card key={cat.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 280 }}>
                                <CardContent sx={{ height: 'auto', flexGrow: 1 }}>
                                    <Typography variant='h5' gutterBottom>{cat.name}</Typography>
                                    <DocumentList documents={cat.documents} editable onDelete={refetchDocuments} />
                                    {cat.documents.length === 0 &&
                                        <Typography>{tVendor("noCatalogPublicFile")}</Typography>
                                    }
                                </CardContent>
                                <CardActions>
                                    <Button variant="contained" style={{ width: "100%" }} onClick={() => setUploadToEntity(cat)}>{tVendor("uploadFile")}</Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                </Box>
            ))}


            <Dialog
                open={uploadToEntity != null}
                closeAfterTransition={false}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1
                }}
                
                onClose={() => setUploadToEntity(null)}
            >
                <DialogTitle>{tVendor("uploadDialogTitle", { entity: uploadToEntityName })}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setUploadToEntity(null)}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                    >
                    <CloseIcon />
                </IconButton>
                <>
                {!!uploadError && <Alert>{uploadError.message}</Alert>}
                {!!uploadToEntity && <DocumentUploader entity={uploadToEntity}
                    onError={setUploadError}
                    onSuccess={() => { setUploadToEntity(null); refetchDocuments(); }}
                />}
                </>
            </Dialog>
        </>
    );
}

export default VendorEditDocuments;