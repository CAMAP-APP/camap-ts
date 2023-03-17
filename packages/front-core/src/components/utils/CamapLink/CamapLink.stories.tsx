import { Box } from '@mui/material';
import CamapLink from './CamapLink';

export const Default = () => {
  return (
    /** */
    <Box p={4}>
      <CamapLink href="link">
        A MUI link with Camap&apos;s dark green color
      </CamapLink>
    </Box>
  );
};

export default {
  title: 'components/utils/Link',
  component: CamapLink,
};
