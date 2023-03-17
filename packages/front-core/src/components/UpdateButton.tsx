import { Edit } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { useCamapTranslation } from '../utils/hooks/use-camap-translation';

const UpdateButton = (props: Omit<ButtonProps, 'startIcon' | 'variant'>) => {
  const { tCommon } = useCamapTranslation({}, true);

  return (
    <Button variant="outlined" startIcon={<Edit />} {...props}>
      {tCommon('change')}
    </Button>
  );
};

export default UpdateButton;
