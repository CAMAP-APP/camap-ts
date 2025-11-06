import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";
import { useVendorProductsSampleQuery } from "@gql";
import { Box, Card, CardActionArea, Dialog, Grid, Typography } from "@mui/material";
import { formatPricePerUnit } from "@utils/fomat";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { useState } from "react";

function VendorProducts({ vendorId }: { vendorId: number }) {

    const { tUnit, tVendorDash } = useCamapTranslation({ tUnit: 'unit', tVendorDash: "vendorDashboard" })

    const { data: { vendorProductsSample } = {}} = useVendorProductsSampleQuery({
        variables: {
            vendorId
        }
    });

    const [selectedProduct, setSelectedProduct] = useState<NonNullable<typeof vendorProductsSample>[number]>()

    return <Box>
        <Typography sx={{ mb: 1 }}>{tVendorDash("productSamplePageDesc")}</Typography>
        <Grid container gap={1}>
            {vendorProductsSample?.map(p => (
                <Card
                    key={p.id}
                    sx={{ 
                        background: "#f8f8f8",
                        width: "140px"
                    }}
                    onClick={() => setSelectedProduct(p)}>
                    <CardActionArea>
                        <img
                            src={p.image}
                            alt={p.name}
                            style={{
                                zIndex: 0,
                                width: '100%',
                                height: '140px',
                                objectFit: 'cover',
                            }}
                        />
                        {p.organic && <Box sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            borderRadius: '50%',
                            userSelect: 'none',
                            color: "#ffffff", // colors of the AB label, no theming
                            backgroundColor: "#2e7d32",
                            width: '32px',
                            height: '32px',
                            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px',
                            paddingBottom: "2px",
                            marginTop: '-10px',
                            marginBottom: '-10px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            zIndex: 10,
                            '& > i': {
                                width: '1.2em'
                            }
                        }}>
                            <CamapIcon id={CamapIconId.bio} />
                        </Box>}
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                fontSize: '13px',
                                lineHeight: '13px',
                                margin: 1,
                                marginTop: 2,
                                gap: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexGrow: 1,
                            }}
                        >
                            <div style={{ textAlign: 'center' }}>{p.name}</div>
                            <div style={{ fontSize: '16px', lineHeight: '18px' }}>
                                {formatPricePerUnit(p.price, p.qt, p.unitType, p.currency, tUnit)}
                            </div>
                        </Box>
                    </CardActionArea>
                </Card>
            ))}
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