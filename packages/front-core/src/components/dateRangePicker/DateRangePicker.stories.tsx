import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import { DateRange } from 'camap-common';
import React from 'react';
import Component from './DateRangePicker';

export const DateRangePicker = ({ withArrows }: { withArrows: boolean }) => {
  const [dateRange, setDateRange] = React.useState<DateRange>({});

  return (
    <Component
      value={dateRange}
      onChange={setDateRange}
      placement="bottom-start"
      withArrows={withArrows}
    />
  );
};

export default {
  title: 'components/utils/DateRangePicker',
  component: Component,
  decorators: [
    (Story) => (
      <Box bgcolor="white" p={4}>
        <Story />
      </Box>
    ),
  ],
  args: {
    withArrows: true,
  },
  argTypes: {
    withArrows: { control: { type: 'boolean' } },
  },
} as Meta;
