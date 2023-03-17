import { Box } from '@mui/material';
import React from 'react';
import DropzoneArea from './DropzoneArea';

const Template = () => {
  return (
    <Box p={2} maxWidth="875px">
      <DropzoneArea
        acceptedFiles={['text/csv', 'image/*']}
        getDropRejectMessage={(
          rejectedFile: File,
          acceptedFiles: string[],
          maxFileSize: number,
        ) => {
          return `Attention c'est pas bien ! rejectedFile: ${rejectedFile.name} acceptedFiles: ${acceptedFiles} maxFileSize: ${maxFileSize}`;
        }}
        onChange={console.log}
        dropzoneText="Glissez et déposez vos fichiers ici"
      />
    </Box>
  );
};

export const Default = Template.bind({});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'components/utils/DropzoneArea',
  component: DropzoneArea,
};
