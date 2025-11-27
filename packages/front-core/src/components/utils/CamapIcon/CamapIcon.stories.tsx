import { Box } from '@mui/material';
import { Meta } from '@storybook/react';
import CamapIcon, { CamapIconId, CamapIconProps } from './CamapIcon';

export const Default = ({ id }: CamapIconProps) => {
  return (
    /** */
    <Box p={4}>
      <CamapIcon id={id} />
    </Box>
  );
};

Default.args = {
  id: 'user',
};

export default {
  title: "components/utils/Camap's font Icon",
  component: CamapIcon,
  argTypes: {
    id: {
      control: {
        type: 'select',
        options: Object.values(CamapIconId),
      },
    },
  },
} as Meta<typeof CamapIcon>;
