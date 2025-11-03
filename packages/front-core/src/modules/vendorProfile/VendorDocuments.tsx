import { Box, Button, CircularProgress, Alert, Typography } from "@mui/material";
import { Catalog, EntityFile, Group, useVendorDocumentsQuery } from "@gql";


type EntityFileLike = Pick<EntityFile, "id" | "documentType" | "data" | "file">;
type GroupLike = Pick<Group, "id" | "name">;
type CatalogLike = Pick<Catalog, "id" | "name"> & { documents: EntityFileLike[], group: GroupLike };

const DocLink = ({doc}:{ doc: EntityFileLike }) => {
    return <Button
        key={doc.id}
        variant="text"
        startIcon={<i className="icon icon-file-pdf" />}
        sx={{ justifyContent: 'flex-start' }}
        onClick={() => {
            if (doc.data) {
                // Convert base64 to blob and download
                const byteCharacters = atob(doc.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = doc.file?.name ?? "No name";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }}
    >
        {doc.file?.name ?? "No name"}
    </Button>
}

function VendorDocuments({ vendorId }: { vendorId: number }) {
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
        if(!groups.has(cat.group.id))
            groups.set(cat.group.id, { group: cat.group, catalogs: [cat] });
        else groups.get(cat.group.id)?.catalogs.push(cat);
        return groups;
    }, new Map<number, { group: GroupLike, catalogs:CatalogLike[] }> )

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {vendor?.documents?.map((doc) => (
                    <DocLink key={doc.id} doc={doc}/>
                ))}
            </Box>
            {Array.from(groups?.values() ?? []).map(({ group, catalogs }) => (
                <Box key={group.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant='h3'>{group.name}</Typography>
                    {catalogs.map((cat) => (
                        <Box key={cat.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant='h4'>{cat.name}</Typography>
                            {cat.documents.map((doc) => (
                                <DocLink key={doc.id} doc={doc} />
                            ))}
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

export default VendorDocuments;