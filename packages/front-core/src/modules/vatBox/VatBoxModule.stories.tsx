import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import React from 'react';
import withApollo from '../../lib/withApollo';
import VatBoxModule, { VatBoxModuleProps } from './VatBox.module';

export const Connected = withApollo((props: VatBoxModuleProps) => {
  return <VatBoxModule {...props} />;
});

export default {
  title: 'modules/VAT Box',
  component: VatBoxModule,
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
    initialTtc: 0,
    currency: '€',
    vatRates: '5.5|20|0',
    initialVat: 5.5,
    formName: 'form798ae7f92b21d50d8a318cfe4e6fa4ef',
  },
} as Meta;
