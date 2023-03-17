import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';

const MediumActionIcon = ({ id }: { id: CamapIconId }) => (
  <CamapIcon
    id={id}
    fontSize="medium"
    color="action"
    sx={{ overflow: 'visible' }}
  />
);

export default MediumActionIcon;
