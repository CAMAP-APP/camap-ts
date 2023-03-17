import React from 'react';
import { Box, IconButton } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import DialogTitleActions, { DialogTitleActionsProps } from './DialogTitleActions';

const Template = (props: DialogTitleActionsProps) => (
  <Box p={2} maxWidth="875px">
    <DialogTitleActions
      actions={
        <IconButton size="large">
          <HelpIcon />
        </IconButton>
      }
      {...props}
    >
      TITLE
    </DialogTitleActions>
  </Box>
);

export const Default = Template.bind({});
Default.args = {};
Default.argTypes = {
  // actions: { control: { disable: true } },
  actions: { control: { disable: true } },
};

export default {
  title: 'components/utils/DialogTitleActions',
  component: DialogTitleActions,
};
