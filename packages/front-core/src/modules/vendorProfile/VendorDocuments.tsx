import { Catalog, EntityFile, Group, useVendorDocumentsQuery } from "@gql";
import { Alert, Box, Card, CardContent, CircularProgress, ListItem, ListItemButton, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";


type EntityFileLike = Pick<EntityFile, "id" | "documentType" | "data" | "file">;
type GroupLike = Pick<Group, "id" | "name">;
type CatalogLike = Pick<Catalog, "id" | "name"> & { documents: EntityFileLike[], group: GroupLike };

const DocLine = ({doc}:{ doc: EntityFileLike }) => {
    
    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

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

    return <ListItem>
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

function VendorDocuments({ vendorId }: { vendorId: number }) {

    const { tVendor } = useCamapTranslation({ tVendor: "vendorDashboard" });

    const { data: { vendor } = {}, loading, error } = useVendorDocumentsQuery({
        variables: { vendorId },
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">{error.message}</Alert>
        );
    }

    const groups = vendor?.catalogs.reduce((groups, cat) => {
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
                    {vendor?.documents?.map((doc) => (
                        <DocLine key={doc.id} doc={doc} />
                    ))}
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
                                            <DocLine key={doc.id} doc={doc} />
                                        ))}
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