import {
  Box,
  Button,
  Paper,
  styled,
  Typography
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
    name?: React.ReactNode;
    website?: { url:string, text?:string };
    phone?: React.ReactNode;
    email?: React.ReactNode;
    other?: React.ReactNode;
  };
  
  // Tabs
  tabs: PublicLayoutTabProps[];
  
  // Default active tab
  defaultTab?: number;
}

const LayoutBox = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));

const SideBox = styled(Box)(({ theme }) => ({
  width: '441px',
  flexGrow: 0,
  position: 'relative',
  minHeight: '1px',
  display: "grid",
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'max-content',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    order: 1,
    flexGrow: 1,
    flexShrink: 0,
  },
  [theme.breakpoints.between('md', 'lg')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

const MainBox = styled(Box)(({ theme }) => ({
  flexGrow: 1
}));

const MapBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '441px',
  height: '441px',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.primary.main}`,
  overflow: 'hidden',
  [theme.breakpoints.down('lg')]: {
    width: '100%',
    flexGrow: 1
  },
  [theme.breakpoints.between('md', 'lg')]: {
    gridColumn: '1',
    gridRow: '1 / span 2'
  },
}));

const ImageList = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  gap: theme.spacing(2),
  [theme.breakpoints.between('md', 'lg')]: {
    gridColumn: '2',
    gridRow: '2',
  },
}));


const SubscriptionPanel = styled(Paper)(({ theme }) => ({
  backgroundColor: '#5D1E4E', // Keep specific brand color
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  alignSelf: 'flex-start',
  gap: theme.spacing(2),
  '& > *': {
    margin: 0,
  },
  [theme.breakpoints.between('md', 'lg')]: {
    gridColumn: '2',
    gridRow: '1',
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
    objectFit: 'contain'
  },
  [theme.breakpoints.down('md')]: {
    '& > h2': {
      fontSize: 24
    },
    '& img': {
      width: '48px'
    },
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: "column",
    gap: 0
  }
}));

const PublicContact = styled(Box)(({ theme }) => ({
  maxWidth: '275px',
  flexShrink: 0,
  backgroundColor: "#f8f8f8",
  borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
  padding: theme.spacing(2),
  minHeight: '64px',
  marginLeft: "auto",
  [theme.breakpoints.down('sm')]: {
    // break out of Boostrap container-fluid
    marginLeft: -15,
    marginRight: -15,
    width: 'calc(100% + 30px)',
    maxWidth: "unset"
  }
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
  [theme.breakpoints.down('md')]: {
    justifyContent: "space-evenly"
  },
  [theme.breakpoints.down('sm')]: {
    // break out of Boostrap container-fluid
    marginLeft: -15,
    marginRight: -15,
    width: 'calc(100% + 30px)'
  }
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
  [theme.breakpoints.down('md')]: {
    flexGrow: 1
  }
}));

const Panel = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  width: "100%"
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
    <LayoutBox>
      {/* Sidebar */}
      <SideBox>
        {/* Map */}
        {mapComponent && (
          <MapBox>
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
          <Typography variant="h2">
            {logo && (
              <img src={logo} alt="" style={{ height: '64px', display: 'inline' }} />
            )}
            {title}
          </Typography>
          {contactInfo && 
            (contactInfo.name || contactInfo.website || contactInfo.phone || contactInfo.email || contactInfo.other)
          && (
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
              {contactInfo.other && (
                <PublicContactItem>
                  {contactInfo.other}
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
  );
};

export default PublicLayout;
