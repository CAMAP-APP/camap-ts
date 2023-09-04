import { ApolloProvider } from '@apollo/client';
import {
  QuitGroupDocument,
  UpdateUserDocument,
  UpdateUserNotificationsDocument,
  User,
  UserAccountDocument,
} from '@gql';
import initApolloClient from '@lib/initApollo';
import { Meta } from '@storybook/react/types-6-0';
import * as faker from 'faker';
import CamapApolloMockedProvider, {
  MockedRequests,
} from '../../../lib/CamapApolloMockedProvider';
import Component from './UserAccount';

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
    query: UserAccountDocument,
    handler: () => {
      return Promise.resolve({
        data: {
          me: genUser(),
          myGroups: [
            {
              id: faker.random.alpha(),
              name: faker.company.companyName(),
              hasPhoneRequired: true,
              hasAddressRequired: true,
            },
            {
              id: faker.random.alpha(),
              name: faker.company.companyName(),
              hasPhoneRequired: false,
              hasAddressRequired: false,
            },
            {
              id: faker.random.alpha(),
              name: faker.company.companyName(),
              hasPhoneRequired: false,
              hasAddressRequired: false,
            },
            {
              id: faker.random.alpha(),
              name: faker.company.companyName(),
              hasPhoneRequired: false,
              hasAddressRequired: false,
            },
          ],
        },
      });
    },
  },
  UpdateUser: {
    query: UpdateUserDocument,
    handler: ([{ input }]) => {
      return Promise.resolve({
        data: {
          updateUser: genUser(input),
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
  QuitGroup: {
    try{
      query: QuitGroupDocument,
      handler: () => {
        return Promise.resolve({
          data: {
            quitGroup: { groupId: 1 },
          },
        });
      },
    }catch(e) {
      throw (e);
    }
  },
};

export const Mocked = () => {
  return (
    <CamapApolloMockedProvider requests={mock}>
      <Component />
    </CamapApolloMockedProvider>
  );
};

export const Connected = () => (
  <ApolloProvider client={apolloClient}>
    <Component currentGroupId={2} />
  </ApolloProvider>
);

export default {
  title: 'modules/users/UserAccount',
  component: Component,
} as Meta;
