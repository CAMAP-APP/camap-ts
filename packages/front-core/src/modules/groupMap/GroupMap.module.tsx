import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import { GetGroupsOnMapQueryVariables, useGetGroupsOnMapLazyQuery } from '@gql';
import { Box, ButtonBase, Grid, styled } from '@mui/material';
import { getDistance } from '@utils/geo';
import { latLng, LatLng } from 'leaflet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer } from 'react-leaflet';
import GeoAutocomplete from '../../containers/geo/GeoAutocomplete';
import { GeoAutocompleteOptionType } from '../../containers/geo/GeoAutocomplete.interface';
import { Colors } from '../../theme/commonPalette';
import { goTo } from '../../utils/url';
import GroupMapRoot from './GroupMapRoot';
import { GroupOnMap } from './interfaces';

const StyledLeafMap = styled(MapContainer)(() => ({
  width: '100%',
  height: '100%',
  minHeight: 'calc(100vh - 280px)',

  '&.leaflet-container .leaflet-popup a': {
    color: Colors.black,
  },
}));

const AnchorClickable = styled('a')(() => ({
  textDecoration: 'none',
  display: 'block',
  border: '1px #DDD solid',
  borderRadius: '8px',
  color: 'inherit',
  backgroundColor: 'white',
  marginBottom: '22px',
  padding: '8px',
  zIndex: 10,

  '&:hover': {
    backgroundColor: '#eee5d6',
    transition: '0.15s ease',
    transitionProperty: 'background-color, transform',
    textDecoration: 'none',
  },

  '&:active': {
    backgroundColor: '#F0D277',
    borderColor: '#ebc349',
    transform: 'scale(0.95)',
    textDecoration: 'none',
  },

  '&:focus': {
    textDecoration: 'none',
  },

  ...{
    minHeight: '110px',
    overflow: 'hidden',
    verticalAlign: 'top',
    position: 'relative',
  },
}));

const ImgGroupImage = styled('img')(() => ({
  height: 'auto',
  width: '92px',
  float: 'left',
  marginRight: '12px',
}));

const H4GroupName = styled('h4')(() => ({
  marginTop: '10px',
  marginBottom: '11px',
}));

const GridLeafletContainer = styled(Grid)(() => ({
  height: 'calc(100vh - 130px)',
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'row',

  [theme.breakpoints.only('xs')]: {
    flexDirection: 'column-reverse',
  },
}));

const ButtonBaseCamapLogo = styled(ButtonBase)(({ theme }) => ({
  backgroundImage: `url(/theme/${window._Camap.theme.id}/logo3.png)`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  height: '130px',
  width: '100%',

  [theme.breakpoints.only('sm')]: {
    backgroundSize: 'contain',
  },
}));

const DEFAULT_LAT = 46.52863469527167; // center of France
const DEFAULT_LNG = 2.43896484375; // center of France
const INIT_ZOOM = 6;
const DEFAULT_ZOOM = 13;

export interface GroupMapProps {
  initLat?: number;
  initLng?: number;
  initAddress?: string;
}

const GroupMap = ({ initLat, initLng, initAddress }: GroupMapProps) => {
  const { t } = useTranslation(['groupMap/default']);

  const [point, setPoint] = React.useState<LatLng | undefined>(
    initLat && initLng ? latLng(initLat, initLng) : undefined,
  );
  const [groups, setGroups] = React.useState<GroupOnMap[]>([]);
  const [groupFocusedId, setGroupFocusedId] = React.useState<
    number | undefined
  >();
  const [showTooLargeWarning, setShowTooLargeWarning] = React.useState(true);
  const wait = React.useRef<boolean>(false);

  const [getGroupsOnMap, { error }] = useGetGroupsOnMapLazyQuery();

  React.useEffect(() => {
    if (!error) return;
    if (wait) wait.current = false;
  }, []);

  const doGetGroupsOnMap = async (variables: GetGroupsOnMapQueryVariables) => {
    const { data } = await getGroupsOnMap({ variables });
    if (!data) return;

    function getGroupDistance(group: GroupOnMap): number | undefined {
      const { lat, lng } = group.place;
      if (!lat || !lng || !point) {
        return undefined;
      }

      const d = getDistance(point.lat, lat, point.lng, lng);
      return Math.round(d * 10) / 10;
    }

    if (wait) wait.current = false;

    const newGroups = [...data.getGroupsOnMap];
    newGroups.forEach((group) =>
      distanceMap.current.set(group.place.id, getGroupDistance(group)),
    );
    const orderedNewGroups = [...newGroups].sort((a, b) => {
      return (
        distanceMap.current.get(a.place.id) -
        distanceMap.current.get(b.place.id)
      );
    });
    setGroups(orderedNewGroups);
  };

  const distanceMap = React.useRef(new Map<number, any>());

  /**
   *  Call API to find groups at lat and lng
   */
  async function fetchGroups(lat: number, lng: number) {
    if (wait.current) {
      return;
    } else {
      wait.current = true;
    }
    await doGetGroupsOnMap({
      lat,
      lng,
      minLat: undefined,
      maxLat: undefined,
      minLng: undefined,
      maxLng: undefined,
    });
    setPoint(latLng(lat, lng));
  }

  React.useEffect(() => {
    if (initAddress) return;
    if (!initLat || !initLng) return;
    fetchGroups(initLat, initLng);
  }, [initLng, initLat]);

  function openPopup(group: GroupOnMap) {
    setGroupFocusedId(group.place.id);
  }

  function closePopup() {
    setGroupFocusedId(undefined);
  }

  /**
   *  Call API to look for groups in the defined bounding box
   */
  async function fetchGroupsInsideBox(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
    if (wait.current) {
      return;
    } else {
      wait.current = true;
    }

    if (maxLat - minLat > 1 || maxLng - minLng > 2) {
      setShowTooLargeWarning(true);
    } else {
      setShowTooLargeWarning(false);
    }
    await doGetGroupsOnMap({
      minLat,
      maxLat,
      minLng,
      maxLng,
      lat: undefined,
      lng: undefined,
    });
  }

  function convertDistance(distance: number): string {
    if (distance > 10000) return `${Math.floor(distance / 1000)} km`;
    if (distance > 1000) return `${Math.floor(distance / 100) / 10} km`;
    return `${distance} m`;
  }

  async function onAutocompleteChange(v: GeoAutocompleteOptionType) {
    if (v !== null) {
      const coord = v.geometry.coordinates;
      await fetchGroups(coord[1], coord[0]);
    }
  }

  function renderGroupMap() {
    const center = !point ? latLng(DEFAULT_LAT, DEFAULT_LNG) : point;
    const zoom = !point ? INIT_ZOOM : DEFAULT_ZOOM;
    return (
      <StyledLeafMap center={center} zoom={zoom} zoomControl={false}>
        <GroupMapRoot
          addressCoord={point}
          groups={groups || []}
          fetchGroupsInsideBox={fetchGroupsInsideBox}
          groupFocusedId={groupFocusedId}
        />
      </StyledLeafMap>
    );
  }

  /**
   * Renders a group in the left list
   */
  function renderGroup(group: GroupOnMap) {
    const addresses = [
      group.place.address1,
      group.place.address2,
      [group.place.zipCode, group.place.city].join(' '),
    ];

    const addressBlock = addresses.map((element) => {
      if (!element) return null;
      return <div key={element}>{element}</div>;
    });

    let distanceComp = null;
    const distance = distanceMap.current.get(group.place.id);
    if (distance)
      distanceComp = (
        <Box
          sx={{
            fontWeight: 'bold',
            color: (theme) => theme.palette.success.main,
            fontSize: '1.2em',
            position: 'absolute',
            right: '8px',
            bottom: '6px',
          }}
        >
          {convertDistance(distance)}
        </Box>
      );

    const img = group.image ? (
      <ImgGroupImage alt={group.name} src={group.image} />
    ) : null;

    return (
      <AnchorClickable
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => openPopup(group)}
        onMouseLeave={closePopup}
        key={group.place.id}
        href={`/group/${group.id}`}
      >
        {img}
        <H4GroupName>{group.name}</H4GroupName>
        <Box fontSize="0.9em" marginRight="52px">
          {addressBlock}
        </Box>
        {distanceComp}
      </AnchorClickable>
    );
  }

  function renderGroupList() {
    let renderedGroups = (
      <>
        {groups.map((group) => {
          return renderGroup(group);
        })}
      </>
    );
    if (groups.length <= 0) {
      renderedGroups = (
        <Box textAlign="center">
          <H4GroupName>
            {t(showTooLargeWarning ? 'searchZoneTooLarge' : 'noGroupFound')}
          </H4GroupName>
          <Box fontSize="0.9em" width="100%">
            {t(
              showTooLargeWarning
                ? 'tryToZoomOrUseSearchBar'
                : 'tryToUnzoomOrUseSearchBar',
            )}
          </Box>
        </Box>
      );
    }

    return (
      <Box width="100%" maxHeight="calc(100vh - 146px)" overflow="auto">
        {renderedGroups}
      </Box>
    );
  }

  function goHome() {
    goTo('/home');
  }

  if (error) return <ApolloErrorAlert error={error} />;

  /** */
  return (
    <Box height="100vh" width="100%">
      <Grid container>
        <Grid item sm={4} xs={12}>
          <ButtonBaseCamapLogo onClick={goHome} />
        </Grid>
        <Grid item sm={8} xs={12}>
          <Box pt={{ xs: 0, sm: 4 }} pb={{ xs: 4, sm: 0 }}>
            <Box width={{ xs: '100%', md: '55%' }} bgcolor="#fff" boxShadow={1}>
              <GeoAutocomplete
                initialValue={initAddress}
                label={t('findAGroupCloseBy')}
                noOptionsText={t('enterAddress')}
                onChange={onAutocompleteChange}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      <GridContainer container spacing={2}>
        <Grid item sm={3} xs={12}>
          {renderGroupList()}
        </Grid>
        <GridLeafletContainer item sm={9} xs={12}>
          {renderGroupMap()}
        </GridLeafletContainer>
      </GridContainer>
    </Box>
  );
};

export default GroupMap;
