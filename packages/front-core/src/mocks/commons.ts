/* eslint-disable no-prototype-builtins */
import { Group, User } from '@gql';
import { subYears } from 'date-fns';
import faker from 'faker/locale/fr';
import { aIntId } from './utils';

export const aUser = (
  overrides?: Partial<User>,
): { __typename: 'User' } & User => {
  return {
    __typename: 'User',
    id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : aIntId(),
    firstName:
      overrides && overrides.hasOwnProperty('firstName')
        ? overrides.firstName!
        : faker.name.firstName(),
    lastName:
      overrides && overrides.hasOwnProperty('lastName')
        ? overrides.lastName!
        : faker.name.lastName(),
    email:
      overrides && overrides.hasOwnProperty('email')
        ? overrides.email!
        : faker.internet.email(),
    address1:
      overrides && overrides.hasOwnProperty('address1')
        ? overrides.address1!
        : faker.address.streetAddress(),
    address2:
      overrides && overrides.hasOwnProperty('address2')
        ? overrides.address2!
        : faker.address.secondaryAddress(),
    zipCode:
      overrides && overrides.hasOwnProperty('zipCode')
        ? overrides.zipCode!
        : faker.address.zipCode(),
    city:
      overrides && overrides.hasOwnProperty('city')
        ? overrides.city!
        : faker.address.city(),
    nationality:
      overrides && overrides.hasOwnProperty('nationality')
        ? overrides.nationality!
        : 'fr',
    countryOfResidence:
      overrides && overrides.hasOwnProperty('countryOfResidence')
        ? overrides.countryOfResidence!
        : 'fr',
    birthDate:
      overrides && overrides.hasOwnProperty('birthDate')
        ? overrides.birthDate!
        : faker.date.past(
            Math.round(Math.random() * 80),
            subYears(new Date(), 18),
          ),
    firstName2:
      overrides && overrides.hasOwnProperty('firstName2')
        ? overrides.firstName2!
        : null,
    lastName2:
      overrides && overrides.hasOwnProperty('lastName2')
        ? overrides.lastName2!
        : null,
    email2:
      overrides && overrides.hasOwnProperty('email2')
        ? overrides.email2!
        : null,
    notifications:
      overrides && overrides.hasOwnProperty('notifications')
        ? overrides.notifications!
        : {
          __typename: "UserNotifications",
          hasEmailNotif4h: true,
          hasEmailNotif24h: true,
          hasEmailNotifOuverture: true
        } ,
  };
};

export const aGroup = (
  overrides?: Partial<Group>,
): { __typename: 'Group' } & Group => {
  return {
    __typename: 'Group',
    id: overrides && overrides.hasOwnProperty('id') ? overrides.id! : aIntId(),
    name:
      overrides && overrides.hasOwnProperty('name')
        ? overrides.name!
        : faker.company.companyName(),
    iban:
      overrides && overrides.hasOwnProperty('iban')
        ? overrides.iban!
        : 'NL91ABNA0417164300',
    users:
      overrides && overrides.hasOwnProperty('users')
        ? overrides.users!
        : [aUser()],
    user:
      overrides && overrides.hasOwnProperty('user') ? overrides.user! : aUser(),
    hasMembership:
      overrides && overrides.hasOwnProperty('hasMembership')
        ? overrides.hasMembership!
        : false,
    betaFlags:
      overrides && overrides.hasOwnProperty('betaFlags')
        ? overrides.betaFlags!
        : 0,
    currencyCode:
      overrides && overrides.hasOwnProperty('currencyCode')
        ? overrides.currencyCode!
        : 'EUR',
    flags: 
      overrides && overrides.hasOwnProperty('flags')
        ? overrides.flags!
        : 0,
    hasAddressRequired:
      overrides && overrides.hasOwnProperty('hasAddressRequired')
        ? overrides.hasAddressRequired!
        :false,
    hasPhoneRequired:
      overrides && overrides.hasOwnProperty('hasPhoneRequired')
        ? overrides.hasPhoneRequired!
        :false,
    multiDistribs:
      overrides && overrides.hasOwnProperty('multiDistribs')
        ? overrides.multiDistribs!
        :[]
  };
};
