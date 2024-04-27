import React from 'react';
import { Meta } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import ConfirmDialog, { ConfirmDialogProps } from './ConfirmDialog';

const Template = (props: ConfirmDialogProps) => {
  return (
    /** */
    <Box p={2} maxWidth="875px">
      <Typography>Use controls</Typography>

      <ConfirmDialog {...props} />
    </Box>
  );
};

export const Default = Template.bind({});
Default.args = {
  open: false,
  title: 'A title',
  message: 'Lorem ipsum dolor sit amet',
  cancelButtonLabel: 'Cancel',
  confirmButtonLabel: 'Confirm',
} as Meta;

export default {
  title: 'components/utils/Confirm dialog',
  component: ConfirmDialog,
};
