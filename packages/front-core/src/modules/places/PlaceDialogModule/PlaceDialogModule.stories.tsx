import React from 'react';
import { Box, Card } from '@mui/material';
import withApollo from '@lib/withApollo';
import PlaceDialogModule, { PlaceDialogModuleProps } from './PlaceDialogModule';

export const Mocked = withApollo((props: PlaceDialogModuleProps) => {
  return <PlaceDialogModule {...props} />;
});

export default {
  title: 'modules/places/PlaceDialogModule',
  component: PlaceDialogModule,
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={875}>
        <Card>
          <Story />
        </Card>
      </Box>
    ),
  ],
  args: {
    placeId: 1,
    onClose: () => {},
  },
};
