import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { reactRouterDefaultProps } from "react-router-config";
import VendorLayout from "layout/VendorLayout";
import VendorDocuments from "./VendorDocuments";
import VendorDescription from "./VendorDescription";
import VendorDistributions from "./VendorDistributions";
import CamapIcon, { CamapIconId } from "@components/utils/CamapIcon";

type VendorLike = {
    id: number,
    name: string,
    profession?: string,
    email?: string,
    phone?: string,
    peopleName?: string,
    image?: string,
    images: {
      logo?: string,
      portrait?: string,
      banner?: string,
      farm1?: string,
      farm2?: string,
      farm3?: string,
      farm4?: string,
    },
    address1?: string,
    address2?: string,
    zipCode: string,
    city: string,
    linkText?: string,
    linkUrl?: string,
    desc?: string,
    longDesc?: string,
};

const VendorProfileRouter = ({ vendor, basePath }: { vendor: VendorLike, basePath: string }) => {

    console.log(vendor);

    const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });

  const suppliersContent = (
    <Box>
      <Typography variant="body1" paragraph>
        Non-complete extract of available products:
      </Typography>
      <Grid container spacing={2}>
        {[
          { name: 'Fresh Farm', city: 'Local City', products: ['Tomatoes', 'Lettuce', 'Carrots'] },
          { name: 'Organic Garden', city: 'Nearby Town', products: ['Apples', 'Pears', 'Berries'] },
        ].map((supplier, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {supplier.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {supplier.city}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {supplier.products.map((product, j) => (
                    <Button
                      key={j}
                      size="small"
                      variant="outlined"
                      sx={{
                        width: '169px',
                        minHeight: '234px',
                        flexDirection: 'column',
                        backgroundColor: '#F8F8F8',
                        border: 'none',
                        borderRadius: '8px',
                        padding: 0,
                        margin: 0,
                        overflow: 'hidden',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={`https://via.placeholder.com/169x169?text=${product}`}
                        alt={product}
                        style={{
                          width: '169px',
                          height: '169px',
                          objectFit: 'cover',
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          fontSize: '13px',
                          lineHeight: '13px',
                          margin: '16px 8px',
                          gap: '4px',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexGrow: 1,
                        }}
                      >
                        <div>{product}</div>
                        <div style={{ fontSize: '16px', lineHeight: '18px' }}>
                          €2.50
                        </div>
                      </Box>
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const tabs = [
    {
        id: 'description',
        label: tVendorDash('publicTabDescription'),
        icon: <CamapIcon id={CamapIconId.info} />,
        path: "/description",
        content: <VendorDescription vendor={vendor} />
    },
    {
        id: 'deliveries',
        label: tVendorDash('publicTabDeliveries'),
        icon: <CamapIcon id={CamapIconId.delivery} />,
        path: "/deliveries",
        content: <VendorDistributions vendor={vendor} />
    },
    {
        id: 'documents',
        label: tVendorDash('publicTabDocuments'),
        icon: <CamapIcon id={CamapIconId.file} />,
        path: "/documents",
        content: <VendorDocuments vendorId={vendor.id} />
    },
    {
        id: 'products',
        label: tVendorDash('publicTabProducts'),
        icon: <CamapIcon id={CamapIconId.products} />,
        path: "/products",
        content: suppliersContent
    },
]

    return <BrowserRouter {...reactRouterDefaultProps} basename={basePath}>
        <Routes>
            <Route element={
                <VendorLayout
                    vendor={vendor}
                    tabs={tabs}
                />
            }>
                {tabs.map(t => <Route key={t.path} path={t.path} element={t.content} />)}
                <Route index element={<Navigate to="/description" replace />} />
            </Route>
        </Routes>
    </BrowserRouter>
}

export default VendorProfileRouter;