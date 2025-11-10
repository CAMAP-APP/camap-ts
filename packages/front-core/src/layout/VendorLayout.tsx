import CamapIcon, { CamapIconId } from '@components/utils/CamapIcon';
import { Group, Place, useVendorActiveCatalogsQuery, useVendorImagesQuery, VendorActiveCatalogsQuery, VendorImagesQuery } from '@gql';
import { Box, Button, Dialog, styled, Typography } from '@mui/material';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import { createContext, useContext, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import PublicLayout, { PublicLayoutTabProps } from './PublicLayout';
import { Icon, LatLngTuple, Point } from 'leaflet';

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
  lat?: number,
  lng?: number,
};

export type PlaceLike = Pick<Place, "id"|"lat"|"lng"|"name">;
export const VendorMapContext = createContext({
  distributionPlaces: [] as PlaceLike[],
  selectedDistributionPlace: undefined as PlaceLike | undefined,
  addDistributionPlace(p: PlaceLike) {},
  setSelectedDistributionPlace(placeId:number) {}
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
  
  const vendorPlace = (vendor.lat && vendor.lng) ? { lat: vendor.lat, lng: vendor.lng } : null;

  const {distributionPlaces, selectedDistributionPlace} = useContext(VendorMapContext);

  const focus = selectedDistributionPlace ?? vendorPlace ?? (distributionPlaces.length > 0 ? distributionPlaces[0] : undefined);
  let center = [ DEFAULT_LAT, DEFAULT_LNG ] as LatLngTuple | undefined;
  if(focus) center = [ focus.lat ?? DEFAULT_LAT, focus?.lng ?? DEFAULT_LNG ];
  const bounds = [
    vendorPlace,
    ...distributionPlaces
  ].filter(x => !!x).filter((x): x is {lat: number, lng: number} => !!x.lat && !!x.lng).map(x => [x.lat, x.lng] as LatLngTuple);
  if(!selectedDistributionPlace && bounds.length > 1)
    center = undefined;

  const icon = useMemo(() => {
    if(!vendor.image) return undefined;
    return new Icon({
      iconUrl: vendor.image,
      iconAnchor: new Point(20, 45),
      popupAnchor: undefined,
      shadowUrl: undefined,
      shadowSize: undefined,
      shadowAnchor: undefined,
      iconSize: new Point(40, 40),
      className: 'leaflet-div-icon'
    });
  }, [vendor]);

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
    <StyledMap
      center={center}
      zoom={!focus ? EMPTY_ZOOM : DEFAULT_ZOOM}
      key={`${distributionPlaces.length}-${focus?.lat}`}
      sx={{
        '& .leaflet-div-icon': {
          borderRadius: '50%',
          borderWidth: 2,
          borderColor: theme => theme.palette.primary.main
        }
      }}
      bounds={!center ? bounds : undefined}
      boundsOptions={{
        maxZoom: DEFAULT_ZOOM,
        paddingTopLeft: new Point(25,50),
        paddingBottomRight: new Point(25,10)
      }}
    >
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vendorPlace && <Marker
        position={{ lat: vendorPlace.lat, lng: vendorPlace.lng }}
        icon={icon}
      />}
      {distributionPlaces.map(p => {
        const { lat, lng,  } = p;
        if(lat && lng)
          return <Marker
            key={`${lat}-${lng}`}
            position={{ lat, lng }}
            title={p.name}
          />
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
  
  const { data: { vendor : { activeCatalogs: catalogs } = {} } = {} } = useVendorActiveCatalogsQuery({
    variables: {
      vendorId: vendor.id
    }
  });

  const groups = useMemo(() => {
      return Array.from(
        catalogs?.reduce((groups, cat: VendorActiveCatalogsQuery["vendor"]["activeCatalogs"][number]) => {
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
