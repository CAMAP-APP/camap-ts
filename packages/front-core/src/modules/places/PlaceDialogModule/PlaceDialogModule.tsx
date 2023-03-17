import CircularProgressBox from '@components/utils/CircularProgressBox';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import { Place, usePlaceQuery } from '@gql';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
  Typography,
} from '@mui/material';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

export interface PlaceDialogModuleProps {
  placeId: number;
  onClose: () => void;
}

const StyledMap = styled(MapContainer)(() => ({
  width: '100%',
  height: '100%',
}));

const firstLetterToUpperCase = (s: string) =>
  `${s.charAt(0).toUpperCase()}${s.slice(1).toLocaleLowerCase()}`;

const formatAddress = (
  place: Pick<Place, 'address1' | 'address2' | 'zipCode' | 'city'>,
) => {
  let res = '';

  if (place.address1) {
    res = `${place.address1}`;
    if (place.address2) {
      res = `${res} ${place.address2}`;
    }
    res = `${res} `;
  }

  if (place.zipCode) {
    res = `${res} ${place.zipCode}`;
  }

  if (place.city) {
    res = `${res} ${firstLetterToUpperCase(place.city)}`;
  }

  return res;
};

const PlaceDialogModule = ({ placeId, onClose }: PlaceDialogModuleProps) => {
  const { data, loading, error } = usePlaceQuery({
    variables: { id: placeId },
  });
  const place = data?.place;

  /** */
  /** */
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading || !place) return <CircularProgressBox />;
  const center = { lat: place.lat || 0, lng: place.lng || 0 };
  return (
    <Dialog open fullWidth onClose={onClose}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">{`${place.name
              .charAt(0)
              .toUpperCase()}${place.name.slice(1)}`}</Typography>
            <Typography>{formatAddress(place)}</Typography>
          </Box>
          <Box ml={2}>
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box position="relative" pt="63%">
          <Box position="absolute" top={0} bottom={0} left={0} right={0}>
            <StyledMap center={center} zoom={13}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center} />
            </StyledMap>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceDialogModule;
