import { Distribution, MultiDistrib, Place } from '@gql';
import { Box, Link, styled } from '@mui/material';
import CamapIcon from './utils/CamapIcon/CamapIcon';
import { CamapIconId } from './utils/CamapIcon/CamapIcon';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';
import theme from 'theme';

interface DeliveryInfoCardProps {
  multiDistrib: Pick<MultiDistrib, 'id' | 'distribStartDate' | 'distribEndDate'>;
  distributions: Array<Pick<Distribution, 'id'> & { catalog: { name: string } }>;
  place?: Pick<Place, 'id' | 'name' | 'address1' | 'address2' | 'city' | 'zipCode'>;
  isFirst?: boolean;
  onPlaceClick?: (placeId: number) => void;
}

const DateBox = styled(Box)(({ theme }) => ({
    '&:not(:first-of-type)': {
        backgroundColor: '#F1F1F1'
    }
}));

const PaddedBox = styled(Box)(({theme}) => ({
    padding: theme.spacing(1)
}))
const DateBoxHeader = (props: { from: Date, to: Date }) => {

    const {t} = useCamapTranslation({});

    const isToday = props.from.toDateString() === new Date().toDateString();

    return <Box className='box'>
        <PaddedBox className="boxLeft">
            {isToday ? <>
                <img src="/img/go.png" alt="" height="36px" style={{ backgroundColor: '#fff', borderRadius: '8px', margin: '5px' }} />
                <div style={{ fontSize:'14px', lineHeight: '14px' }}>
                    { props.from.getHours() < 12 && t("THIS MORNING")}
                    { props.from.getHours() >= 12 && props.from.getHours() < 18 && t("THIS AFTERNOON")}
                    { props.from.getHours() >= 18 && t("THIS EVENING")}
                </div>
            </> : <>
                <div>{props.from.toLocaleDateString(undefined, { weekday: 'long' })}</div>
				<div className="date-calendar">{props.from.toLocaleDateString(undefined, { day: 'numeric' })}</div>
				<div>{props.from.toLocaleDateString(undefined, { month: 'long' })}</div>
            </>}
        </PaddedBox>
        <PaddedBox className="boxRight">
            <span>{props.from.getHours()}<sup>{t("h")}</sup>{props.from.getMinutes() > 0 && <span>{props.from.getMinutes()}</span>}</span>
            <div style={{backgroundColor: '#5D1E4E', width: '16px', height: '1px' }} />
            <span>{props.to.getHours()}<sup>{t("h")}</sup>{props.to.getMinutes() > 0 && <span>{props.to.getMinutes()}</span>}</span>
        </PaddedBox>
      </Box>
};

const DeliveryCatalogs = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  flexGrow: 1,
  backgroundColor: 'rgba(255,255,255,20%)',
  color: '#333333',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  '& ul': {
    textAlign: 'left',
    paddingLeft: theme.spacing(2),
    margin: 0
  },
  '& ul > li': {
    padding: 0,
    margin: 0
  }
}));

const DeliveryPlace = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  flexGrow: 0,
  lineHeight: '13px',
  fontSize: '13px',
  padding: '8px',
  color: '#333333',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  '& a': {
    color: '#333333',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  'div:first-of-type > &': {
    color: 'white'
  },
  'div:first-of-type > & a': {
    color: 'white'
  }
}));

const DeliveryInfoCard = ({
  multiDistrib,
  distributions,
  place,
  isFirst = false,
  onPlaceClick,
}: DeliveryInfoCardProps) => {

    const {t} = useCamapTranslation({});

  const startDate = new Date(multiDistrib.distribStartDate);
  const endDate = new Date(multiDistrib.distribEndDate);

  const handlePlaceClick = () => {
    if (place && onPlaceClick) {
      onPlaceClick(place.id);
    }
  };

  return (
    <DateBox className='dateBox'>
      <DateBoxHeader from={startDate} to={endDate} />

      {/* Catalogs List */}
      {distributions.length > 0 && (
        <DeliveryCatalogs>
          <Box component="ul" sx={{ 
            textAlign: 'left',
            paddingLeft: '16px',
            margin: 0,
            '& > li': {
              padding: 0,
              margin: 0,
            }
          }}>
            {distributions.map((distribution) => (
              <Box
                key={distribution.id}
                component="li"
              >
                {distribution.catalog.name}
              </Box>
            ))}
          </Box>
        </DeliveryCatalogs>
      )}

      {/* Place Information */}
      {place && (
        <DeliveryPlace>
          <CamapIcon id={CamapIconId.mapMarker} style={{ fontSize: '13px' }} />
          {onPlaceClick ? (
            <Link
              component="button"
              onClick={handlePlaceClick}
            >
              {place.name}
            </Link>
          ) : place.name
          }
        </DeliveryPlace>
      )}
    </DateBox>
  );
};

const StyledDeliveryList = styled(Box)(({ theme }) => ({
  padding: '24px 8px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}));

export const DeliveryList = ({ 
  deliveries 
}: { 
  deliveries: Omit<DeliveryInfoCardProps, 'isFirst'>[] 
}) => {
  return (
    <StyledDeliveryList>
      {deliveries.slice(0,4).map((d, i) => (
        <DeliveryInfoCard 
          key={d.multiDistrib.id} 
          {...d} 
          isFirst={i === 0}
        />
      ))}
    </StyledDeliveryList>
  );
};

export default DeliveryInfoCard;
