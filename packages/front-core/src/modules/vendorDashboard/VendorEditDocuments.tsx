import { Box, CircularProgress, Alert, Typography, Modal, ListItemButton, ListItemIcon, ListItemText, Button, ListItem, IconButton, Card, CardHeader, CardContent, CardActions } from "@mui/material";
import { Catalog, EntityFile, Group, useDeleteDocumentMutation, useVendorCatalogsQuery, useVendorDocumentsQuery, Vendor } from "@gql";
import DocumentUploader from "@components/DocumentUploader";
import { useState } from "react";
import { Delete } from "@mui/icons-material";
import { Stub } from "@utils/gql";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";


type EntityFileLike = Pick<EntityFile, "id" | "documentType" | "data" | "file">;
type GroupLike = Pick<Group, "id" | "name">;
type CatalogLike = Pick<Catalog, "id" | "name"> & { group: GroupLike };

const DocLine = ({doc, onChange}:{ doc: EntityFileLike, onChange: () => void }) => {
    
    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

    const [ deleteDocument ] = useDeleteDocumentMutation({
        variables: {
            id: doc.id
        }
    });

    const [deleting, setDeleting] = useState(false);

    const onClick = () => {
        if (doc.file?.data) {
            // Convert base64 to blob and download
            const byteCharacters = atob(doc.file?.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc.file?.name ?? "No name"}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return <ListItem
        secondaryAction={
            <IconButton edge="end"
                aria-label="delete"
                onClick={async () => {
                    setDeleting(true);
                    await deleteDocument();
                    onChange();
                }}
                disabled={deleting}
            >
                {deleting && <CircularProgress />}
                {!deleting && <Delete/>}
            </IconButton>
        }
    >
        <ListItemButton
            component="a"
            sx={{ wordBreak: 'break-all' }}
            onClick={onClick}
        >
            <i className="icon icon-file-pdf" />
            {doc.file?.name ?? tVendor("noDocumentName")}
        </ListItemButton>
    </ListItem>
}

function VendorEditDocuments({ vendorId }: { vendorId: number }) {

    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

    const { data: { vendor: vendorDocuments } = {}, loading: loadingDocuments, error: errorDocuments, refetch: refetchDocuments } = useVendorDocumentsQuery({
        variables: { vendorId },
    });
    const { data: { vendor: vendorCatalogs } = {}, loading: loadingCatalogs, error: errorCatalogs } = useVendorCatalogsQuery({
        variables: { vendorId },
    })


    const [uploadToEntity, setUploadToEntity] = useState<Stub<Vendor | Group | Catalog> | null>(null);
    const [uploadError, setUploadError] = useState<Error | null>(null);

    if (loadingDocuments || loadingCatalogs) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (errorDocuments)
        return <Alert severity="error">{errorDocuments.message}</Alert>;
    if (errorCatalogs)
        return <Alert severity="error">{errorCatalogs.message}</Alert>;
        

    const groups = vendorCatalogs?.catalogs.reduce((groups, cat) => {
        if(!groups.has(cat.group.id))
            groups.set(cat.group.id, { group: cat.group, catalogs: [{...cat, documents: []}] });
        else groups.get(cat.group.id)?.catalogs.push({...cat, documents:[]});
        return groups;
    }, new Map<number, { group: GroupLike, catalogs:(CatalogLike & {documents: EntityFileLike[]})[] }> )!;
    vendorDocuments?.catalogs.forEach(cat => {
        if(!groups.has(cat.group.id))
            groups.set(cat.group.id, { group: cat.group, catalogs: [cat] });
        else {
            const {catalogs} = groups.get(cat.group.id)!;
            const c = catalogs.find(c => c.id === cat.id);
            if(c) c.documents.push(...cat.documents);
            else catalogs.push(cat);
        }
    })

    return (
        <>
            <Box>
                <Box sx={{ paddingBottom: 3 }}>
                    {vendorDocuments?.documents?.map((doc) => (
                        <DocLine key={doc.id} doc={doc} onChange={refetchDocuments}/>
                    ))}
                    {vendorDocuments?.documents.length === 0 &&
                        <Typography>{tVendor("noVendorPublicFile")}</Typography>
                    }
                    {!!vendorDocuments &&
                        <button className="btn btn-primary" onClick={() => setUploadToEntity(vendorDocuments)}>{tVendor("uploadFile")}</button>
                    }
                </Box>
                {Array.from(groups?.values() ?? []).map(({ group, catalogs }) => (
                    <Box key={group.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='h4'>{tVendor("inGroupGroupName", { groupName: group.name })}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                            {catalogs.map((cat) => (
                                <Card key={cat.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: 350 }}>
                                    <CardContent sx={{ height: 'auto', flexGrow: 1 }}>
                                        <Typography variant='h5'>{cat.name}</Typography>
                                        {cat.documents.map((doc) => (
                                            <DocLine key={doc.id} doc={doc} onChange={refetchDocuments}/>
                                        ))}
                                        {cat.documents.length === 0 &&
                                            <Typography>{tVendor("noCatalogPublicFile")}</Typography>
                                        }
                                    </CardContent>
                                    <CardActions>
                                        <button className="btn btn-primary" onClick={() => setUploadToEntity(cat)}>{tVendor("uploadFile")}</button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
            <Modal
                open={uploadToEntity != null}
                closeAfterTransition={false}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClose={() => setUploadToEntity(null)}
            >
                <>
                {!!uploadError && <Alert>{uploadError.message}</Alert>}
                {!!uploadToEntity && <DocumentUploader entity={uploadToEntity} onError={setUploadError} onSuccess={() => { setUploadToEntity(null); refetchDocuments(); }}/>}
                </>
            </Modal>
        </>
    );
}

export default VendorEditDocuments;