/* eslint-disable i18next/no-literal-string */
import { ClosedCaption } from '@mui/icons-material';
import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import BlockComponent from './Block';
import SubBlockComponent from './SubBlock';

export const SubBlock = () => {
  return (
    <Box p={4}>
      <SubBlockComponent title="Sub block title">Content</SubBlockComponent>
    </Box>
  );
};

export const Block = () => {
  return (
    <Box p={4}>
      <BlockComponent title="Block title" icon={<ClosedCaption />}>
        <SubBlock />
      </BlockComponent>
    </Box>
  );
};

export default {
  title: 'components/utils/Block',
  component: BlockComponent,
} as Meta<typeof BlockComponent>;
