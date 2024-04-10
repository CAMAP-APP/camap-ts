import React from 'react';
import { Meta } from '@storybook/react';
import * as faker from 'faker';
import Component from './UserPartnerForm';

// @ts-ignore
faker.setLocale('fr');

export const UserPartnerForm: React.VFC<{}> = () => (
  <Component
    partner={{
      firstName2: faker.name.firstName(),
      lastName2: faker.name.lastName(),
      email2: faker.internet.email(),
      phone2: faker.phone.phoneNumber(),
    }}
    onSubmit={() => {}}
  />
);

export default {
  title: 'modules/users/components/UserPartnerForm',
  component: Component,
} as Meta;
