import { Paper } from '@mui/material';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { Group, User } from '../../../../gql';
import Component from './UserGroups';

export const UserGroups: React.VFC<{}> = () => (
  <Paper>
    <Component
      groups={
        [
          { id: 1, name: 'Les locavores affamés' },
          { id: 2, name: 'Les biovores gloutons' },
        ] as Group[]
      }
      user={
        {
          firstName: 'Jean-Michel',
          lastName: 'LeDev',
          email: 'admin@camap.localdomain',
        } as User
      }
    />
  </Paper>
);

export default {
  title: 'modules/users/components/UserGroups',
  component: Component,
} as Meta;
