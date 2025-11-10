import CamapIcon, { CamapIconId } from '@components/utils/CamapIcon';
import { Group, Place, useVendorCatalogsQuery, useVendorImagesQuery, VendorCatalogsQuery, VendorImagesQuery } from '@gql';
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

const ImageGallery = ({images}: {
  images: VendorImagesQuery['vendor']['media'],
}) => {
  
  const [selectedImage, setSelectedImage] = useState<(typeof images)[number]>();

  return <>
      {images.map((image) => (
        <Button
          key={image.id}
          sx={{
            width: '75px',
            height: '78px',
            borderRadius: '8px',
            padding: 0,
            border: 0,
            overflow: 'hidden',
            minWidth: 'unset',
          }}
          onClick={() => setSelectedImage(image)}
        >
          <img
            src={image.url}
            alt={image.name ?? ''}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </Button>
      ))}
      <Dialog
        open={selectedImage !== undefined}
        onClose={() => setSelectedImage(undefined)}
        closeAfterTransition={false}
      >
        { selectedImage !== undefined && <img
          src={selectedImage.url}
          alt={selectedImage.name ?? ''}
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
      return Array.from(
        catalogs?.reduce((groups, cat: VendorCatalogsQuery["vendor"]["catalogs"][number]) => {
          groups.add(cat.group);
          return groups;
        }, new Set<GroupLike>()) ?? []
      )
    }, [catalogs]);

  if(groups.length === 0)
    return <Typography>{tVendorDash("subscriptionBoxTitleEmpty")}</Typography>

  return <>
    <Typography>{tVendorDash("subscriptionBoxTitle")}</Typography>
    {Array.from(groups).map(g => (
      <Button
        key={g.id}
        variant="contained"
        fullWidth
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
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

  const { data: { vendor: { media: vendorImages } = {}} = {}} = useVendorImagesQuery({
    variables: { vendorId: vendor.id }
  })

  return <PublicLayout
      title={vendor.name}
      logo={vendor.image}
      contactInfo={{
        name: vendor.peopleName,
        email: vendor.email,
        phone: vendor.phone,
        website: vendor.linkUrl ? { url: vendor.linkUrl, text: vendor.linkText } : undefined
      }}
      tabs={tabs}
      mapComponent={<VendorMap vendor={vendor}/>}
      imageGallery={vendorImages && vendorImages.length > 0 && <ImageGallery images={vendorImages}/>}
      subscriptionPanel={<SubscriptionPanel vendor={vendor}/>}
    />
};

export default VendorLayout;
