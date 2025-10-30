import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { useCamapTranslation } from "@utils/hooks/use-camap-translation";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { reactRouterDefaultProps } from "react-router-config";
import { DeliveryList } from "@components/DeliveryInfoCard";
import VendorLayout from "layout/VendorLayout";

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

  // Tab content examples
  const descriptionContent = (
    <Box>
      <Typography variant="body1" paragraph>
        This is a sample group description. It can contain rich text content,
        images, and other elements to describe the group's mission and activities.
      </Typography>
      <Typography variant="body1" paragraph>
        The group focuses on sustainable agriculture and local food distribution,
        bringing together producers and consumers in a community-supported agriculture model.
      </Typography>
    </Box>
  );

  const deliveriesContent = (
    <>
        <Typography>
            Groupe CAMAP 1
        </Typography>
        <DeliveryList deliveries={[
            ...[1, 2, 3].map((_,i) => ({
                    distributions: [
                        { id: 1001, catalog: { name: "AMAP Variable Legumes"} },
                        { id: 1002, catalog: { name: "Poulets gros poulet kot kot kot"} },
                        { id: 1003, catalog: { name: "Contrat confiture long long long"} }
                    ],
                    multiDistrib: {
                        id: 100+i,
                        distribStartDate: `2025-1${i}-30 18:30`,
                        distribEndDate: `2025-1${i}-30 21:00`,
                    },
                    place: { id: 10, name: "Place du Marché à longerons les chataignes", address1: "1 place du marché", address2:"", city:"Longerons-Les-Chataignes", zipCode: "99886"}
                }))
        ]} />
        <Typography>
            Groupe CAMAP 2
        </Typography>
        <DeliveryList deliveries={[
            ...[1, 2, 3].map((_,i) => ({
                    distributions: [
                        { id: 1001, catalog: { name: "AMAP Variable Legumes"} },
                        { id: 1002, catalog: { name: "Poulets gros poulet kot kot kot"} },
                        { id: 1003, catalog: { name: "Contrat confiture long long long"} }
                    ],
                    multiDistrib: {
                        id: 100+i,
                        distribStartDate: `2025-1${i}-30 18:30`,
                        distribEndDate: `2025-1${i}-30 21:00`,
                    },
                    place: { id: 10, name: "Place du Marché à longerons les chataignes", address1: "1 place du marché", address2:"", city:"Longerons-Les-Chataignes", zipCode: "99886"}
                }))
        ]} />
    </>
  );

  const documentsContent = (
    <Box>
      <Typography variant="body1" paragraph>
        Available documents:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {['Group Charter.pdf', 'Membership Rules.pdf', 'Product Catalog.pdf'].map((doc, i) => (
          <Button
            key={i}
            variant="text"
            startIcon={<i className="icon icon-file-pdf" />}
            sx={{ justifyContent: 'flex-start' }}
          >
            {doc}
          </Button>
        ))}
      </Box>
    </Box>
  );

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
        label: 'Description',
        icon: <span className="glyphicon glyphicon-info-sign"/>,
        path: "/description",
        content: descriptionContent
    },
    {
        id: 'deliveries',
        label: 'Next deliveries',
        icon: <span className="glyphicon glyphicon-time" />,
        path: "/deliveries",
        content: deliveriesContent
    },
    {
        id: 'documents',
        label: 'Documents',
        icon: <span className="glyphicon glyphicon-file" />,
        path: "/documents",
        content: documentsContent
    },
    {
        id: 'suppliers',
        label: 'Suppliers and products',
        icon: <span className="glyphicon glyphicon-user" />,
        path: "/vendors",
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
                <Route path={tabs[0].path} element={tabs[0].content} />
                <Route path={tabs[1].path} element={tabs[1].content} />
                <Route path={tabs[2].path} element={tabs[2].content} />
                <Route path={tabs[3].path} element={tabs[3].content} />
                <Route index element={<Navigate to="/description" replace />} />
            </Route>
        </Routes>
    </BrowserRouter>
}

export default VendorProfileRouter;