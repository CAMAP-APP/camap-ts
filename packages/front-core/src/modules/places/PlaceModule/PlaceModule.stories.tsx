import React from 'react';
import { Box } from '@mui/material';
import PlaceModule, { PlaceModuleProps } from './PlaceModule';
import withApollo from '../../../lib/withApollo';

export const Connected = withApollo((props: PlaceModuleProps) => {
  return <PlaceModule {...props} />;
});

export default {
  title: 'modules/places/PlaceModule',
  component: PlaceModule,
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={875}>
        <Box width="100%" height="300px">
          <Story />
        </Box>
      </Box>
    ),
  ],
  args: {
    placeId: 1,
  },
};
