import { ApolloProvider } from '@apollo/client';
import React from 'react';
import initApolloClient from '../../lib/initApollo';
import MembershipDialog, {
  MembershipDialogProps,
} from './MembershipDialog.module';

const apolloClient = initApolloClient({});

export const Dialog = ({
  userName,
  userId,
  groupId,
}: MembershipDialogProps) => {
  return (
    <ApolloProvider client={apolloClient}>
      <MembershipDialog
        callbackUrl="#"
        userName={userName}
        userId={userId}
        groupId={groupId}
      />
    </ApolloProvider>
  );
};

Dialog.args = {
  groupId: 1,
  userId: 1,
  userName: 'Jean-Mi',
};

export default {
  title: 'modules/Membership',
  component: MembershipDialog,
};
