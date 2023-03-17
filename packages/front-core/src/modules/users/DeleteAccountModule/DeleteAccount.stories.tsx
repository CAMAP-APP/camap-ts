import { ApolloProvider } from '@apollo/client';
import initApolloClient from '@lib/initApollo';
import { Meta } from '@storybook/react/types-6-0';
import { DeleteAccountDocument, LogoutDocument } from '../../../gql';
import CamapApolloMockedProvider, {
  MockedRequests,
} from '../../../lib/CamapApolloMockedProvider';
import Component, { DeleteAccountModuleProps } from './DeleteAccount.module';

const apolloClient = initApolloClient({});

const mock: MockedRequests = {
  DeleteAccount: {
    query: DeleteAccountDocument,
    handler: () => {
      return Promise.resolve({
        data: {
          DeleteAccount: 1,
        },
      });
    },
  },
  Logout: {
    query: LogoutDocument,
    handler: () => {
      return Promise.resolve({
        data: {},
      });
    },
  },
};

export const Mocked = () => {
  return (
    <CamapApolloMockedProvider requests={mock}>
      <Component userId={1} />
    </CamapApolloMockedProvider>
  );
};

export const Connected = ({ userId }: DeleteAccountModuleProps) => (
  <ApolloProvider client={apolloClient}>
    <Component userId={userId} />
  </ApolloProvider>
);

export default {
  title: 'modules/users/DeleteAccount',
  component: Component,
  args: {
    userId: 5429,
  },
} as Meta;
