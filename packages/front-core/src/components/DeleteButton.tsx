import { DeleteForever } from '@mui/icons-material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { useCamapTranslation } from '../utils/hooks/use-camap-translation';

const DeleteButton = (
  props: Omit<LoadingButtonProps, 'startIcon' | 'variant'>,
) => {
  const { tCommon } = useCamapTranslation({}, true);

  return (
    <LoadingButton
      variant="outlined"
      color="error"
      startIcon={<DeleteForever />}
      {...props}
    >
      {tCommon('delete')}
    </LoadingButton>
  );
};

export default DeleteButton;
