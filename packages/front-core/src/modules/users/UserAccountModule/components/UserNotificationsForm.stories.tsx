import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import * as faker from 'faker';
import Component from './UserNotificationsForm';

// @ts-ignore
faker.setLocale('fr');

export const UserNotificationsForm: React.VFC<{}> = () => (
  <Component
    notifications={{
      hasEmailNotif4h: Math.random() > 5,
      hasEmailNotif24h: Math.random() > 5,
      hasEmailNotifOuverture: Math.random() > 5,
    }}
    onSubmit={() => {}}
  />
);

export default {
  title: 'modules/users/components/UserNotificationsForm',
  component: Component,
} as Meta;
