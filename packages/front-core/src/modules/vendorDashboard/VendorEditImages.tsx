import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import CircularProgressBox from "@components/utils/CircularProgressBox";
import { useDeleteDocumentMutation, useVendorImagesQuery } from "@gql";
import { Alert, Box, Button, Card, CardHeader, CardMedia, Grid, IconButton } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import ImageUploader, { ImageUploaderContext } from "modules/imageUploader/ImageUploader";
import { useState } from "react";

function VendorEditImages({ vendorId }: { vendorId: number }) {

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

    const {
        data: { vendor: { media: vendorImages = [] } = {} } = {},
        loading,
        error,
        refetch
    } = useVendorImagesQuery({ variables: { vendorId } });

    const [deleteImageMutation] = useDeleteDocumentMutation();

    const [open, setOpen] = useState(false)

    if (loading) {
        return <CircularProgressBox />;
    }

    if (error)
        return <Alert severity="error">{error.message}</Alert>;

    return (<>
        <Grid container sx={{ gap: 1 }}>
            {vendorImages && vendorImages
                .map(({ id, name, url }) => (<Card
                    key={id}
                    sx={{
                        backgroundColor: "#e0e0e0",
                        width: 180,
                        flexGrow: 0
                    }}
                >
                    <CardHeader
                        titleTypographyProps={{
                            variant: "body1",
                            fontSize: '14px',
                            sx: {
                                wordBreak: 'break-all'
                            }
                        }}
                        title={name}
                        action={<IconButton aria-label="delete" size="small"
                            onClick={() => deleteImageMutation({ variables: { id } }).then(() => refetch())}
                        >
                            <CamapIcon id={CamapIconId.delete} />
                        </IconButton>
                        }
                    />
                    <CardMedia
                        sx={{
                            height: 200,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundSize: 'contain',
                        }}
                        image={url}
                    />
                </Card>
                ))
            }</Grid>
        <Box sx={{ mt: 2, mb: 2 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>{tVendorDash("uploadMedia")}</Button>
        </Box>
        <ImageUploader
            open={open}
            onClose={() => setOpen(false)}
            context={ImageUploaderContext.VENDOR_MEDIA}
            entityId={vendorId}
            width={1200}
            height={1200}
            onSuccess={refetch}
        />
    </>
    );
}

export default VendorEditImages;