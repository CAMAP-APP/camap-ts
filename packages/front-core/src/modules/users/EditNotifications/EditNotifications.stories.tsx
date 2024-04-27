import { ApolloProvider } from '@apollo/client';
import {
  GetUserFromControlKeyDocument,
  UpdateUserNotificationsDocument,
  User,
} from '@gql';
import initApolloClient from '@lib/initApollo';
import { Meta } from '@storybook/react';
import * as faker from 'faker';
import CamapApolloMockedProvider, {
  MockedRequests,
} from '../../../lib/CamapApolloMockedProvider';
import Component, { EditNotificationsProps } from './EditNotifications.module';

// @ts-ignore
faker.setLocale('fr');

const apolloClient = initApolloClient({});

const genUser = (data?: Partial<User>) => ({
  __typename: 'User',
  id: data?.id || 1,
  firstName: data?.firstName || faker.name.firstName(),
  lastName: data?.lastName || faker.name.lastName(),
  email: data?.email || faker.internet.email(),
  phone: data?.phone || faker.phone.phoneNumber(),
  birthDate: data?.birthDate || new Date(),
  nationality: data?.nationality || 'fr',
  address1: data?.address1 || faker.address.streetAddress(),
  address2: data?.address2 || null,
  zipCode: data?.zipCode || faker.address.zipCode(),
  city: data?.city || faker.address.city(),
  countryOfResidence: data?.countryOfResidence || 'fr',
  firstName2: data?.firstName2 || faker.name.firstName(),
  lastName2: data?.lastName2 || faker.name.lastName(),
  email2: data?.email2 || faker.internet.email(),
  phone2: data?.phone2 || faker.phone.phoneNumber(),
  notifications: {
    __typename: 'UserNotifications',
    hasEmailNotif4h:
      data?.notifications?.hasEmailNotif4h || Math.random() > 0.5,
    hasEmailNotif24h:
      data?.notifications?.hasEmailNotif24h || Math.random() > 0.5,
    hasEmailNotifOuverture:
      data?.notifications?.hasEmailNotifOuverture || Math.random() > 0.5,
  },
});

const mock: MockedRequests = {
  User: {
    query: GetUserFromControlKeyDocument,
    handler: () => {
      return Promise.resolve({
        data: {
          getUserFromControlKey: genUser(),
        },
      });
    },
  },

  UpdateUserNotifications: {
    query: UpdateUserNotificationsDocument,
    handler: ([{ input }]) => {
      return Promise.resolve({
        data: {
          updateUserNotifications: genUser({ notifications: input }),
        },
      });
    },
  },
};

export const Mocked = () => {
  return (
    <CamapApolloMockedProvider requests={mock}>
      <Component userId={1} controlKey={''} />
    </CamapApolloMockedProvider>
  );
};

export const Connected = ({ userId, controlKey }: EditNotificationsProps) => (
  <ApolloProvider client={apolloClient}>
    <Component userId={userId} controlKey={controlKey} />
  </ApolloProvider>
);

export default {
  title: 'modules/users/EditNotifications',
  component: Component,
  args: {
    userId: 3,
    controlKey: '6ccfbb2b757d97525f33054df0684277436dddb3',
  },
} as Meta;
