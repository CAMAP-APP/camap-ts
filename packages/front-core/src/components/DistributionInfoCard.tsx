import { Catalog, MultiDistrib, Place } from '@gql';
import { Box, Link, styled } from '@mui/material';
import CamapIcon from './utils/CamapIcon/CamapIcon';
import { CamapIconId } from './utils/CamapIcon/CamapIcon';
import { useCamapTranslation } from '@utils/hooks/use-camap-translation';

interface DistributionInfoCardProps {
  id: number,
  date: Date,
  catalogId: number,
  orderEndDate: Date,
  orderStartDate: Date,
  end: Date,
  catalog: Pick<Catalog, "id"|"name">,
  place: Pick<Place, "id"|"name"|"address1"|"city"|"zipCode">,
  multiDistrib: Pick<MultiDistrib, "id"|"distribStartDate"|"distribEndDate">,
  isFirst?: boolean,
  onPlaceClick?: (placeId: number) => void
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

const DistributionCatalogs = styled(Box)(({ theme }) => ({
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

const DistributionPlace = styled(Box)(({ theme }) => ({
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

const DistributionInfoCard = ({
  id,
  date,
  catalogId,
  orderEndDate,
  orderStartDate,
  end,
  catalog,
  place,
  multiDistrib,
  isFirst = false,
  onPlaceClick,
}: DistributionInfoCardProps) => {

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

      <DistributionCatalogs>
        <Box component="ul" sx={{ 
          textAlign: 'left',
          paddingLeft: '16px',
          margin: 0,
          '& > li': {
            padding: 0,
            margin: 0,
          }
        }}>
          <Box
              component="li"
            >
              {catalog.name}
            </Box>
        </Box>
      </DistributionCatalogs>

      {/* Place Information */}
      {place && (
        <DistributionPlace>
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
        </DistributionPlace>
      )}
    </DateBox>
  );
};

const StyledDistributionsList = styled(Box)(({ theme }) => ({
  padding: '24px 8px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
}));

export const DistributionList = ({ 
  distributions,
  onPlaceClick
}: { 
  distributions: Omit<DistributionInfoCardProps, 'isFirst' | 'onPlaceClick'>[]
  onPlaceClick?: (placeId: number) => void;
}) => {

  return (
    <StyledDistributionsList>
      {distributions.slice(0,4).map((d, i) => (
        <DistributionInfoCard 
          key={d.multiDistrib.id} 
          {...d}
          onPlaceClick={onPlaceClick}
          isFirst={i === 0}
        />
      ))}
    </StyledDistributionsList>
  );
};

export default DistributionInfoCard;
