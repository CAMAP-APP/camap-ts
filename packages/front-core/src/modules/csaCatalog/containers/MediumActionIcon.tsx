import { IconProps } from '@mui/material';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';

const MediumActionIcon = ({ id, sx }: { id: CamapIconId } & IconProps) => (
  <CamapIcon
    id={id}
    fontSize="medium"
    color="action"
    sx={{
      overflow: 'visible',
      ...sx
    }}
  />
);

export default MediumActionIcon;
