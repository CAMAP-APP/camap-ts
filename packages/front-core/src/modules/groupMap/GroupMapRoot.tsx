import GroupLeafletMarker from '@components/map/GroupLeafletMarker';
import {
  FeatureGroup as LeafletFeatureGroup,
  icon,
  LatLng,
  LatLngBounds,
  Layer,
  Marker as LeafletMarker,
} from 'leaflet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FeatureGroup,
  Marker,
  TileLayer,
  useMap,
  useMapEvent,
  ZoomControl,
} from 'react-leaflet';
import { GroupOnMap } from './interfaces';

type GroupMapRootProps = {
  addressCoord?: LatLng;
  groups: Array<GroupOnMap>;
  fetchGroupsInsideBox: (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) => Promise<void>;
  groupFocusedId?: number;
};

const DEFAULT_BOUNDS = new LatLngBounds(
  [52.10650519075632, 13.117675781250002],
  [40.17887331434698, -8.063964843750002],
);

const GroupMapRoot = ({
  addressCoord,
  groups,
  fetchGroupsInsideBox,
  groupFocusedId,
}: GroupMapRootProps) => {
  const { t } = useTranslation(['groupMap/default']);

  const [isFitting, setIsFitting] = React.useState<boolean>(false);
  const [focusedMarker, setFocusedMarker] = React.useState<Layer>();

  const map = useMap();
  const featureGroupRef = React.useRef<LeafletFeatureGroup>(null);
  const markerMapRefs = React.useRef<Map<number, LeafletMarker>>(
    new Map<number, LeafletMarker>(),
  );
  const previousGroupsRef = React.useRef(groups);

  React.useEffect(() => {
    let areEquals = groups.length === previousGroupsRef.current.length;
    if (areEquals) {
      groups.forEach((group, index) => {
        if (group.id !== previousGroupsRef.current[index].id) {
          areEquals = false;
        }
      });
    }
    if (areEquals) return;
    if (previousGroupsRef.current.length === 0) {
      setIsFitting(true);
    }
    previousGroupsRef.current = groups;
  }, [groups]);

  const homeIcon = icon({
    iconUrl: '/img/home.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -30],
    className: 'icon',
  });

  /**
   *  Call API to get groups in the current bounding box
   */
  async function getGroups() {
    if (!map) return;
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    await fetchGroupsInsideBox(
      southWest.lat,
      northEast.lat,
      southWest.lng,
      northEast.lng,
    );
  }

  React.useEffect(() => {
    if (!featureGroupRef) return;
    setIsFitting(true);
  }, [featureGroupRef]);

  function fitBounds() {
    if (!map || !featureGroupRef.current) return;
    const bounds = featureGroupRef.current.getBounds();
    if (!bounds.isValid()) {
      map.fitBounds(DEFAULT_BOUNDS);
    } else {
      map.fitBounds(bounds, {
        padding: [30, 30],
      });
    }
  }

  React.useEffect(() => {
    if (!isFitting) return;
    fitBounds();
  }, [isFitting]);

  useMapEvent('moveend', () => {
    if (!map) return;
    if (
      groups.length &&
      addressCoord &&
      map.distance(map.getCenter(), addressCoord) === 0
    ) {
      setIsFitting(true);
    } else if (isFitting) {
      setIsFitting(false);
    } else if (map.getZoom() > 5) {
      getGroups();
    }
  });

  React.useEffect(() => {
    if (groupFocusedId) {
      if (!focusedMarker) {
        const markerMapRef = markerMapRefs.current.get(groupFocusedId);
        if (!markerMapRef) return;
        markerMapRef.openPopup();

        setFocusedMarker(markerMapRef);
      } else {
        focusedMarker.closePopup();
      }
    } else if (focusedMarker) {
      focusedMarker.closePopup();

      setFocusedMarker(undefined);
    }
  }, [groupFocusedId]);

  const setMarkerRef = (el: any, placeId: number) => {
    markerMapRefs.current.set(placeId, el);
  };

  function renderGroupMarkers() {
    const markers = groups.map((g) => {
      const { lat, lng } = g.place;
      if (!lat || !lng) return null;
      return (
        <GroupLeafletMarker
          key={`group_${g.placeId}`}
          latitude={lat}
          longitude={lng}
          groupId={g.id}
          groupName={g.name}
          groupImage={g.image || undefined}
          setRef={(el) => setMarkerRef(el, g.place.id)}
        />
      );
    });

    return <>{markers}</>;
  }

  function renderHomeMarker() {
    if (addressCoord) return <Marker position={addressCoord} icon={homeIcon} />;
    return null;
  }

  return (
    <>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        id="bubar.cih3inmqd00tjuxm7oc2532l0"
      />
      <ZoomControl zoomInTitle={t('zoomIn')} zoomOutTitle={t('zoomOut')} />
      {renderHomeMarker()}
      <FeatureGroup ref={featureGroupRef}>{renderGroupMarkers()}</FeatureGroup>
    </>
  );
};

const propsAreEqual = (
  prevProps: GroupMapRootProps,
  nextProps: GroupMapRootProps,
) => {
  if (prevProps.groupFocusedId !== nextProps.groupFocusedId) return false;

  let areGroupsEqual = true;

  if (prevProps.groups.length !== nextProps.groups.length) {
    areGroupsEqual = false;
  }

  if (areGroupsEqual) {
    prevProps.groups.every((prevGroup, i) => {
      const nextGroup = nextProps.groups.length >= i && nextProps.groups[i];
      if (nextGroup && nextGroup.id !== prevGroup.id) {
        areGroupsEqual = false;
        return false;
      }
      return true;
    });
  }

  const areAddressesEqual =
    prevProps.addressCoord?.lat === nextProps.addressCoord?.lat &&
    prevProps.addressCoord?.lng === nextProps.addressCoord?.lng;

  return areGroupsEqual && areAddressesEqual;
};

export default React.memo(GroupMapRoot, propsAreEqual);
