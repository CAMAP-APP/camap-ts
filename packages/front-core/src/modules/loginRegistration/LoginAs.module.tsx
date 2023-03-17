import { Dialog, DialogTitle } from '@mui/material';
import React from 'react';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import { useLoginAsMutation } from '../../gql';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';
import { goTo } from '../../utils/url';

const LoginAsModule = ({
  userId,
  groupId,
}: {
  userId: number;
  groupId?: number;
}) => {
  if (typeof userId !== 'number')
    throw new Error('LoginRegistration requires a userId');
  const { t } = useCamapTranslation({
    t: 'login-registration',
  });
  const [open, setOpen] = React.useState(true);

  const [loginAsMutation, { data, error }] = useLoginAsMutation({
    variables: {
      userId,
      groupId,
    },
  });

  React.useEffect(() => {
    loginAsMutation();
  }, [loginAsMutation]);

  React.useEffect(() => {
    if (!data) return;

    goTo('/');
  }, [data]);

  const handleClose = (_: any, reason: string) => {
    if (reason === 'backdropClick') return;
    setOpen(false);
  };

  if (error) return <ApolloErrorAlert error={error} />;

  return (
    <Dialog open={open} onClose={handleClose} disableEscapeKeyDown>
      <DialogTitle>{t('loginAs')}</DialogTitle>
    </Dialog>
  );
};

export default LoginAsModule;
