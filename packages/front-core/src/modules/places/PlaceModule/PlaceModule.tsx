import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import { usePlaceQuery } from '@gql';
import { styled } from '@mui/material';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

export interface PlaceModuleProps {
  placeId: number;
}

const StyledMap = styled(MapContainer)(() => ({
  width: '100%',
  height: '100%',
}));

const PlaceModule = ({ placeId }: PlaceModuleProps) => {
  const { data, loading, error } = usePlaceQuery({
    variables: { id: placeId },
  });
  const place = data?.place;

  /** */
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading || !place) return <CircularProgressBox />;

  const center = { lat: place.lat || 0, lng: place.lng || 0 };
  return (
    <StyledMap center={center} zoom={13}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} />
    </StyledMap>
  );
};

export default PlaceModule;
