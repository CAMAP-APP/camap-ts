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
import { formatAddress } from 'camap-common';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Place } from '../../../gql';
import { firstLetterUppercase } from '../../../utils/fomat';

export interface DialogMapProps {
  place: Place;
  onClose: () => void;
}

const StyledMap = styled(MapContainer)(() => ({
  width: '100%',
  height: '100%',
}));

const DialogMap = ({ place, onClose }: DialogMapProps) => {
  /** */
  const renderTitle = () => {
    if (place) {
      return (
        <>
          <Typography variant="h5">{`${firstLetterUppercase(
            place.name,
          )}`}</Typography>
          <Typography>{formatAddress(place)}</Typography>
        </>
      );
    }
    return <></>;
  };

  const renderContent = () => {
    if (place.lat && place.lng) {
      const center = { lat: place.lat || 0, lng: place.lng || 0 };
      return (
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
      );
    }

    return <></>;
  };

  /** */
  return (
    <Dialog open fullWidth onClose={onClose}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>{renderTitle()}</Box>
          <Box ml={2}>
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  );
};

export default DialogMap;
