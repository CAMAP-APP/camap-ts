import { Alert } from '@mui/material';
import { useCamapTranslation } from '../utils/hooks/use-camap-translation';

export interface CommonAlertErrorProps {
  message?: string;
}

export const CommonAlertError = ({ message }: CommonAlertErrorProps) => {
  const { t } = useCamapTranslation({
    tError: 'errors',
  });

  /** */
  return (
    <Alert severity="error">{message || t('INTERNAL_SERVER_ERROR')}</Alert>
  );
};

export default CommonAlertError;
