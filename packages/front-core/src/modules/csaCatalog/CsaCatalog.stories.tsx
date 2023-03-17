import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import React from 'react';
import Component from './CsaCatalog.module';

export const CsaCatalog = ({
  catalogId,
  userId,
  subscriptionId,
}: {
  catalogId: number;
  userId: number;
  subscriptionId?: number;
}) => {
  return (
    <Component
      catalogId={catalogId}
      userId={userId}
      subscriptionId={subscriptionId}
    />
  );
};

export default {
  title: 'modules/CSA',
  component: Component,
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box
        p={{
          xs: 1,
          sm: 2,
        }}
        maxWidth={1170}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    catalogId: 8973,
    userId: 3,
    subscriptionId: null,
  },
} as Meta;
