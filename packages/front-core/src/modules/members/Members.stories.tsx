import { ApolloProvider } from '@apollo/client';
import React from 'react';
import initApolloClient from '../../lib/initApollo';
import Members, { MembersProps } from './Members.module';

const apolloClient = initApolloClient({});

export const Default = ({ groupId, token }: MembersProps) => {
  return (
    <ApolloProvider client={apolloClient}>
      <Members groupId={groupId} token={token} />
    </ApolloProvider>
  );
};

Default.args = {
  groupId: 1,
  token: 'token',
};

export default {
  title: 'modules/Members',
  component: Members,
};
