import { User } from '../../gql';

type Member = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'firstName2'
  | 'lastName2'
  | 'city'
  | 'zipCode'
  | 'address1'
  | 'phone'
  | 'email'
  | 'phone2'
  | 'email2'
>;

export default Member;
