import React from 'react';
import { Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadButton, { UploadButtonProps } from './UploadButton';

const Template = (props: UploadButtonProps) => (
  <Box p={2} maxWidth="875px">
    <UploadButton {...props}>UPLOAD</UploadButton>
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  variant: 'outlined',
  color: 'primary',
  startIcon: <CloudUploadIcon />,
  onChange: () => {},
} as UploadButtonProps;

export default {
  title: 'components/utils/UploadButton',
  componrnt: UploadButton,
};
