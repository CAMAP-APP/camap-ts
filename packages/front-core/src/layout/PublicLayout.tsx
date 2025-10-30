import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  styled,
} from '@mui/material';
import { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export interface PublicLayoutTabProps {
  id: string;
  label: string;
  icon?: ReactNode;
  path: string;
}

interface PublicLayoutProps {
  // Sidebar content
  mapComponent?: ReactNode;
  imageGallery?: ReactNode;
  subscriptionPanel?: ReactNode;
  
  // Main content
  title: string;
  logo?: string;
  contactInfo?: {
    name?: string;
    website?: { url:string, text?:string };
    phone?: string;
    email?: string;
  };
  
  // Tabs
  tabs: PublicLayoutTabProps[];
  
  // Default active tab
  defaultTab?: number;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('xl')]: {
    maxWidth: '1400px',
  },
}));

const LayoutBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));

const SideBox = styled(Box)(({ theme }) => ({
  width: '471px',
  position: 'relative',
  minHeight: '1px',
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    order: 1,
    flexShrink: 0,
  },
}));

const MainBox = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  minHeight: '1px',
  paddingRight: theme.spacing(2),
  paddingLeft: theme.spacing(2),
}));

const MapBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '441px',
  height: '441px',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.primary.main}`,
  overflow: 'hidden',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    maxWidth: '441px',
  },
}));

const NextDelivery = styled(Box)(({ theme }) => ({
  lineHeight: '42px',
  paddingLeft: '64px',
  verticalAlign: 'center',
  background: 'rgba(255, 255, 255, 90%)',
  color: theme.palette.text.secondary,
  position: 'absolute',
  zIndex: 1000,
  width: '100%',
  fontWeight: 700,
}));

const ImageList = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));


const SubscriptionPanel = styled(Paper)(({ theme }) => ({
  backgroundColor: '#5D1E4E', // Keep specific brand color
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  gap: theme.spacing(2),
  '& > *': {
    margin: 0,
  },
}));

const TitleAndContact = styled(Box)(({ theme }) => ({
  width: 'auto',
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  gap: theme.spacing(6),
  alignItems: 'center',
  alignContent: 'space-between',
  '& > h2': {
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'nowrap',
    flexDirection: 'row',
    gap: theme.spacing(2),
    alignItems: 'center',
    alignContent: 'space-between',
    lineHeight: '2.3rem',
    margin: 0,
  },
  '& > *': {
    margin: 0,
  },
  '& img': {
    width: '64px',
    height: 'auto',
  },
}));

const PublicContact = styled(Box)(({ theme }) => ({
  maxWidth: '275px',
  flexShrink: 0,
  backgroundColor: "#f8f8f8",
  borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
  padding: theme.spacing(2),
  minHeight: '64px',
  marginLeft: "auto"
}));

const PublicContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  flexDirection: 'row',
  gap: theme.spacing(1),
  alignItems: 'center',
  textAlign: 'left',
  '& > span:first-of-type': {
    width: '16px',
    flexShrink: 0,
    textAlign: 'center',
  },
  '& > a': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#f8f8f8",
  borderRadius: `${theme.spacing(1)} 0px ${theme.spacing(1)} ${theme.spacing(1)}`,
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
}));

const TabButton = styled(Button)(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  border: 0,
  borderRadius: theme.spacing(1),
  backgroundColor: "#f8f8f8",
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  height: '64px',
  minWidth: 'unset',
  color: theme.palette.text.primary,
  '&.tab-active': {
    backgroundColor: "#e8e8e8",
    color: theme.palette.primary.main,
  },
}));

const Panel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const PublicLayout = ({
  mapComponent,
  imageGallery,
  subscriptionPanel,
  title,
  logo,
  contactInfo,
  tabs,
  defaultTab = 0,
}: PublicLayoutProps) => {

  const navigate = useNavigate();
  const {pathname} = useLocation();

  return (
    <StyledContainer maxWidth={false}>
      <LayoutBox>
        {/* Sidebar */}
        <SideBox>
          {/* Map */}
          {mapComponent && (
            <MapBox>
              <NextDelivery>
                {/* Next delivery content would go here */}
              </NextDelivery>
              {mapComponent}
            </MapBox>
          )}

          {/* Image Gallery */}
          {imageGallery && (
            <ImageList>
              {imageGallery}
            </ImageList>
          )}

          {/* Subscription Panel */}
          {subscriptionPanel && (
            <SubscriptionPanel elevation={0}>
              {subscriptionPanel}
            </SubscriptionPanel>
          )}
        </SideBox>

        {/* Main Content */}
        <MainBox>
          {/* Title and Contact */}
          <TitleAndContact>
            <Typography variant="h1">
              {logo && (
                <img src={logo} alt="" style={{ height: '64px', display: 'inline' }} />
              )}
              {title}
            </Typography>
            {contactInfo && (
              <PublicContact>
                {contactInfo.name && (
                  <PublicContactItem>
                    <span className="glyphicon glyphicon-user" />
                    <Typography variant="body2" fontWeight="bold">
                      {contactInfo.name}
                    </Typography>
                  </PublicContactItem>
                )}
                {contactInfo.website && (
                  <PublicContactItem>
                    <span className="glyphicon glyphicon-share" />
                    <a href={contactInfo.website.url} target="_blank" rel="noopener noreferrer">
                      {contactInfo.website.text ?? contactInfo.website.url}
                    </a>
                  </PublicContactItem>
                )}
                {contactInfo.phone && (
                  <PublicContactItem>
                    <span className="glyphicon glyphicon-earphone" />
                    <Typography variant="body2">{contactInfo.phone}</Typography>
                  </PublicContactItem>
                )}
                {contactInfo.email && (
                  <PublicContactItem>
                    <span className="glyphicon glyphicon-envelope" />
                    <a href={`mailto:${contactInfo.email}`}>
                      {contactInfo.email}
                    </a>
                  </PublicContactItem>
                )}
              </PublicContact>
            )}
          </TitleAndContact>

          {/* Tabs */}
          <TabsContainer aria-label="Navigation tabs">
            {tabs.map((tab, index) => (
              <TabButton
                key={tab.id}
                className={pathname === tab.path ? 'tab-active' : ''}
                onClick={() => navigate(tab.path)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabButton>
            ))}
          </TabsContainer>

          <Panel>
            <Outlet />
          </Panel>
        </MainBox>
      </LayoutBox>
    </StyledContainer>
  );
};

export default PublicLayout;
