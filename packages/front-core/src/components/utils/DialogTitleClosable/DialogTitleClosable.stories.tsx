import React from 'react';
import { Box } from '@mui/material';
import DialogTitleClosable, { DialogTitleClosableProps } from './DialogTitleClosable';

const Template = (props: DialogTitleClosableProps) => (
  <Box p={2} maxWidth="875px">
    <DialogTitleClosable {...props}>TITLE</DialogTitleClosable>
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  onClose: () => {},
};

export default {
  title: 'components/utils/DialogTitleClosable',
  component: DialogTitleClosable,
};
