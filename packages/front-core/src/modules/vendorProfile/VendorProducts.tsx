import { useVendorProductsSampleQuery } from "@gql";
import { Box, Card, CardActionArea, CardContent, Dialog, Grid, Typography } from "@mui/material";
import { formatPricePerUnit } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";
import theme from "theme";

function VendorProducts({ vendorId }: { vendorId: number }) {

    const { tUnit, tVendorDash } = useCamapTranslation({ tUnit: 'unit', tVendorDash: "vendorDashboard" })

    const { data: { vendorProductsSample } = {}} = useVendorProductsSampleQuery({
        variables: {
            vendorId
        }
    });

    const [selectedProduct, setSelectedProduct] = useState<NonNullable<typeof vendorProductsSample>[number]>()

    return <Box>
        <Typography>{tVendorDash("productSamplePageDesc")}</Typography>
        <Grid container gap={1}>
            {vendorProductsSample?.map(p => <Card key={p.id} sx={{ background: theme.palette.tonalOffset }} onClick={() => setSelectedProduct(p)}>
                <CardActionArea>
                    <img
                        src={p.image}
                        alt={p.name}
                        style={{
                            width: '140px',
                            height: '140px',
                            objectFit: 'cover',
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: '13px',
                            lineHeight: '13px',
                            margin: 1,
                            gap: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexGrow: 1,
                        }}
                    >
                        <div>{p.name}</div>
                        <div style={{ fontSize: '16px', lineHeight: '18px' }}>
                        {formatPricePerUnit(p.price, p.qt, p.unitType, p.currency, tUnit)}
                        </div>
                    </Box>
                </CardActionArea>
            </Card>)}
        </Grid>
        <Dialog
            open={selectedProduct != null}
            onClose={() => setSelectedProduct(undefined)}
        >
            {selectedProduct && <>
                <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    style={{
                        width: '169px',
                        height: '169px',
                        objectFit: 'cover',
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        fontSize: '13px',
                        lineHeight: '13px',
                        margin: 1,
                        gap: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: 1,
                    }}
                >
                    <div>{selectedProduct.name}</div>
                    <div style={{ fontSize: '16px', lineHeight: '18px' }}>
                        {formatPricePerUnit(selectedProduct.price, selectedProduct.qt, selectedProduct.unitType, selectedProduct.currency, tUnit)}
                    </div>
                </Box>
                <Box>{selectedProduct.desc}</Box>
            </>
            }
        </Dialog>
    </Box>

}

export default VendorProducts;