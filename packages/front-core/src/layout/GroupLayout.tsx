import { Box, Button, Typography } from '@mui/material';
import PublicLayout, { PublicLayoutTabProps } from './PublicLayout';

type Group = {
  name: string,
  logo: string
};

const GroupLayout = ({
  group,
  tabs
}: {
  group: Group
  tabs: PublicLayoutTabProps[]
}) => {

    // Map component example
  const mapComponent = (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Map Component
      </Typography>
    </Box>
  );

  // Image gallery example
  const imageGallery = (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Button
          key={i}
          sx={{
            width: '75px',
            height: '78px',
            borderRadius: '8px',
            padding: 0,
            border: 0,
            overflow: 'hidden',
            minWidth: 'unset',
          }}
        >
          <img
            src={`https://via.placeholder.com/75x78?text=Image${i}`}
            alt={''}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
        </Button>
      ))}
    </>
  );

  // Subscription panel example
  const subscriptionPanel = (
    <>
      <Typography variant="h6">Inscriptions :</Typography>
      <Typography variant="body2">
        Contact the person in charge in order to subscribe to this group and get to know membership conditions.
      </Typography>
      <Button
        variant="contained"
        sx={{
          minWidth: '218px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <span style={{ fontFamily: 'monospace', paddingRight: '12px' }}>&gt;</span>
        Membership request
      </Button>
    </>
  );

  return <PublicLayout
    title={group.name}
    tabs={tabs}
    mapComponent={mapComponent}
    imageGallery={imageGallery}
    subscriptionPanel={subscriptionPanel}
  />;
};

export default GroupLayout;
