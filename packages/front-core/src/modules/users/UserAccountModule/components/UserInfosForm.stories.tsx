import React from 'react';
import { Meta } from '@storybook/react';
import Component from './UserInfosForm';

export const UserInfosForm: React.VFC<{}> = () => (
  <Component
    user={{ firstName: 'Jean', lastName: 'ValJean', email: 'jean@valjean.fr' }}
    onSubmit={() => {}}
    isPhoneRequired={false}
    isAddressRequired={false}
  />
);

export default {
  title: 'modules/users/components/UserInfosForm',
  component: Component,
} as Meta;
