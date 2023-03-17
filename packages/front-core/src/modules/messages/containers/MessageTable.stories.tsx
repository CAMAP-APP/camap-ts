import React from 'react';
import { Box } from '@mui/material';
import withApollo from '@lib/withApollo';
import MessageTable from './MessageTable';

const ConnectedTemplate = withApollo((args: any) => {
  return <MessageTable {...args} />;
});

export const Message = ConnectedTemplate.bind({});
Message.args = {
  messageId: 3,
};

export default {
  title: 'modules/MessagingService/MessageTable',
  component: MessageTable,
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={875}>
        <Story />
      </Box>
    ),
  ],
};
