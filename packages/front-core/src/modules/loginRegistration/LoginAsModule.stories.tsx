import React from 'react';
import withApollo from '../../lib/withApollo';
import LoginAsModule from './LoginAs.module';

export const Default = withApollo(
  ({ userId, groupId }: { userId: number; groupId: number }) => {
    return <LoginAsModule userId={userId} groupId={groupId} />;
  },
);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'modules/LoginRegistration/loginAs',
  component: LoginAsModule,
  args: {
    userId: 1,
    groupId: 3,
  },
};
