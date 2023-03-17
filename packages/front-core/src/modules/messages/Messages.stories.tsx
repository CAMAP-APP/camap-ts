import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import withApollo from '../../lib/withApollo';
import Messages, { MessagesProps } from './Messages.module';

const ConnectedTemplate = withApollo(
  ({ groupId, whichUser }: MessagesProps) => {
    return <Messages groupId={groupId} whichUser={whichUser} />;
  },
);

export const Default = ConnectedTemplate.bind({});
Default.args = {
  groupId: 1,
  whichUser: false,
};

export default {
  title: 'modules/MessagingService/Messages',
  component: Messages,
} as Meta;
