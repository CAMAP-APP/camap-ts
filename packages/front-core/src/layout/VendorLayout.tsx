import CamapIcon, { CamapIconId } from '@components/utils/CamapIcon';
import { Group, Place, useVendorCatalogsQuery } from '@gql';
import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { createContext, useContext, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import PublicLayout, { PublicLayoutTabProps } from './PublicLayout';

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

export type PlaceLike = Pick<Place, "lat"|"lng">;
export const VendorMapContext = createContext({
  distributionPlaces: [] as PlaceLike[],
  selectedDistributionPlace: undefined as PlaceLike | undefined,
  addDistributionPlace(p: PlaceLike) {},
  setSelectedDistributionPlace(p: PlaceLike) {}
});

const DEFAULT_LAT = 46.52863469527167; // center of France
const DEFAULT_LNG = 2.43896484375; // center of France
const EMPTY_ZOOM = 5;
const DEFAULT_ZOOM = 13;

const StyledMap = styled(MapContainer)(() => ({
  width: '100%',
  height: '100%',
}));
const VendorMap = ({vendor}: {
  vendor: VendorLike,
}) => {
  
  const {distributionPlaces, selectedDistributionPlace} = useContext(VendorMapContext);

  const focus = selectedDistributionPlace ?? (distributionPlaces.length > 0 ? distributionPlaces[0] : undefined);
  const center = { lat: focus?.lat ?? DEFAULT_LAT, lng: focus?.lng ?? DEFAULT_LNG }

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
    <StyledMap center={center} zoom={!focus ? EMPTY_ZOOM : DEFAULT_ZOOM} key={focus?.lat}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {distributionPlaces.map(p => {
        const { lat, lng } = p;
        if(lat && lng)
            return <Marker key={`${lat}-${lng}`} position={{ lat, lng }} />
          return false;
      })}
    </StyledMap>
  </Box>
}

const ImageGallery = ({vendor}: {
  vendor: VendorLike,
}) => {
  
  const images = Object.entries(vendor.images).filter(([k,image]) => !!image && k !== 'logo');

  const [[selectedKey, selectedImage] = [], setSelectedImage] = useState<[string, string]>();

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
          onClick={() => setSelectedImage([key, image])}
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
      <Dialog
        open={!!selectedKey}
        onClose={() => setSelectedImage(undefined)}
        closeAfterTransition={false}
      >
        { selectedKey && <img
          src={selectedImage}
          alt={selectedKey}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />}
      </Dialog>
    </>
}

type GroupLike = Pick<Group, "id" | "name">;
const SubscriptionPanel = ({vendor}: {
  vendor: VendorLike,
}) => {

  const { tVendorDash } = useCamapTranslation({ tVendorDash: "vendorDashboard" });
  
  const { data: { vendor : { catalogs } = {} } = {} } = useVendorCatalogsQuery({
    variables: {
      vendorId: vendor.id
    }
  });

  const groups = useMemo(() => {
      return catalogs?.reduce((groups, cat) => {
        groups.add(cat.group);
        return groups;
      }, new Set<GroupLike>()) ?? []
  }, [catalogs]);

  return <>
    <Typography>{tVendorDash("subscriptionBoxTitle")}</Typography>
    {Array.from(groups).map(g => (
      <Button
        key={g.id}
        variant="contained"
        sx={{
          minWidth: '218px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
        href={`/group/${g.id}`}
      >
        <CamapIcon id={CamapIconId.chevronRight} />
        {g.name}
      </Button>
      ))}
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
      logo={vendor.images.logo}
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
    />
};

export default VendorLayout;
