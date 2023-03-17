import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { icon, Marker as LeafletMarker } from 'leaflet';
import React from 'react';
import { Marker, Popup } from 'react-leaflet';

interface GroupLeafletMarkerProps {
  latitude: number;
  longitude: number;
  groupId: number;
  groupName: string;
  groupImage?: string;
  setRef?: (el: LeafletMarker) => void;
}

const StyledPopup = styled(Popup)(() => ({
  '& .leaflet-popup-content-wrapper': {
    padding: 0,
    '& .leaflet-popup-content': {
      margin: 0,
    },
  },

  '& .leaflet-popup-close-button': {
    display: 'none',
  },

  '& .leaflet-popup-tip-container': {
    display: 'none',
  },
}));

const GroupLeafletMarker = ({
  latitude,
  longitude,
  groupId,
  groupName,
  groupImage,
  setRef,
}: GroupLeafletMarkerProps) => {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isPopupHovered, setIsPopupHovered] = React.useState(false);

  const markerIcon = icon({
    iconUrl: '/img/marker.svg',
    iconSize: isPopupHovered || isPopupOpen ? [44, 44] : [40, 40],
    iconAnchor: isPopupHovered || isPopupOpen ? [22, 42] : [20, 40],
    popupAnchor: [0, -38],
  });

  const onPopupOpen = () => setIsPopupOpen(true);
  const onPopupClose = () => setIsPopupOpen(false);

  const onmouseover = () => setIsPopupHovered(true);
  const onmouseout = () => setIsPopupHovered(false);

  return (
    <Marker
      ref={setRef}
      position={[latitude, longitude]}
      icon={markerIcon}
      eventHandlers={{ mouseover: onmouseover, mouseout: onmouseout }}
    >
      <StyledPopup
        eventHandlers={{ popupopen: onPopupOpen, popupclose: onPopupClose }}
      >
        <Card>
          <CardActionArea href={'/group/' + groupId}>
            {groupImage && (
              <CardMedia
                sx={{
                  height: 140,
                  backgroundSize: 'contain',
                }}
                image={groupImage}
              />
            )}
            <CardContent>
              <Typography component="span">{groupName}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </StyledPopup>
    </Marker>
  );
};

export default GroupLeafletMarker;
