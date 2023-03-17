import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import { getYear } from 'date-fns';
import React from 'react';
import Component from './VolunteersCalendar.module';

const roles = [
  { id: 1, name: 'Permanence AMAP Légumes 1	' },
  { id: 2, name: 'Permanence poisson' },
  { id: 3, name: 'Permanence Bières & Cidre	' },
];
const toBeDone = 5;
const done = 7;

const year = getYear(new Date());

export const VolunteersCalendar = ({ userId }: { userId: number }) => {
  return (
    <Component
      userId={userId}
      roles={roles}
      toBeDone={toBeDone}
      done={done}
      fromDate={`${year - 1}-09-01 00:00:00`}
      toDate={`${year}-09-01 00:00:00`}
      daysBeforeDutyPeriodsOpen={15}
    />
  );
};

export default {
  title: 'modules/CSA',
  component: Component,
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={1170}>
        <Story />
      </Box>
    ),
  ],
  args: {
    userId: 1,
  },
  argTypes: {
    userId: { control: { type: 'number' } },
  },
} as Meta;
