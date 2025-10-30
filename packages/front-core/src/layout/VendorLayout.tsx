import { Box, Button, Typography } from '@mui/material';
import PublicLayout, { PublicLayoutTabProps } from './PublicLayout';
import GroupMap from '@components/map/GroupMap';

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

const VendorMap = ({vendor}: {
  vendor: VendorLike,
}) => {
  return <Box
    sx={{
      width: '100%',
      height: '100%',
      backgroundColor: '#e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <GroupMap />
  </Box>
}

const ImageGallery = ({vendor}: {
  vendor: VendorLike,
}) => {
  
  const images = Object.entries(vendor.images).filter(([,image]) => !!image);

  return <>
      {images.map(([key, image]) => (
        <Button
          key={key}
          sx={{
            width: '75px',
            height: '78px',
            borderRadius: '8px',
            padding: 0,
            border: 0,
            overflow: 'hidden',
            minWidth: 'unset',
          }}
        >
          <img
            src={image}
            alt={key}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </Button>
      ))}
    </>
}

const SubscriptionPanel = ({vendor}: {
  vendor: VendorLike,
}) => {
  // const { getGroupsFromVendor: { groups } = {} } = doGetGroupsFromVendor(vendor.id)

  // Subscription panel example
  return <>
      <Button
        variant="contained"
        sx={{
          minWidth: '218px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <span style={{ fontFamily: 'monospace', paddingRight: '12px' }}>&gt;</span>
        Membership request CAMAP 1
      </Button>
      <Button
        variant="contained"
        sx={{
          minWidth: '218px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <span style={{ fontFamily: 'monospace', paddingRight: '12px' }}>&gt;</span>
        Membership request CAMAP 2
      </Button>
    </>
}

const VendorLayout = ({
  vendor,
  tabs
}: {
  vendor: VendorLike,
  tabs: PublicLayoutTabProps[]
}) => {
  return <PublicLayout
    title={vendor.name}
    contactInfo={{
      name: vendor.peopleName,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.linkUrl ? { url: vendor.linkUrl, text: vendor.linkText } : undefined
    }}
    tabs={tabs}
    mapComponent={<VendorMap vendor={vendor}/>}
    imageGallery={<ImageGallery vendor={vendor}/>}
    subscriptionPanel={<SubscriptionPanel vendor={vendor}/>}
  />;
};

export default VendorLayout;
