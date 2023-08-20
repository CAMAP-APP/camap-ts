import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import { useDeleteAccountMutation, useLogoutMutation } from '@gql';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';
import React from 'react';
import AlertError from '../../../components/utils/AlertError';
import DialogTitleClosable from '../../../components/utils/DialogTitleClosable';
import i18n from '../../../lib/i18n';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { goTo } from '../../../utils/url';

export interface DeleteAccountModuleProps {
  userId: number;
}

const TRANSLATION_NAMESPACE = 'users/delete-account';

const DeleteAccountModule = ({ userId }: DeleteAccountModuleProps) => {
  const { t } = useCamapTranslation({
    t: TRANSLATION_NAMESPACE,
  });
  const [open, toggleOpen] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const [deleteAccountMutation, { loading, error }] =
    useDeleteAccountMutation();
  const [logout] = useLogoutMutation();

  const onDeleteAccount = async () => {
    try {
      const { data: deleteAccount } = await deleteAccountMutation({
        variables: {
          userId,
          password,
        },
      });
    } catch (e) {
      this.error.message = (e.message);
      throw (e);
    }

    if (!deleteAccount) return;

    await logout();

    goTo('/user/logout');
  };

  const onOpen = () => toggleOpen(true);
  const onCancel = () => toggleOpen(false);

  const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  /** */
  return (
    <>
      <Button variant="outlined" onClick={onOpen}>
        {t('deleteMyAccount')}
      </Button>
      <Dialog open={open} onClose={onCancel}>
        <DialogTitleClosable onClose={onCancel}>
          {t('weAreSadToSeeYouLeaving')}
        </DialogTitleClosable>
        <DialogContent>
          {error && (
            <Box mb={1}>
              {!i18n.exists(`${TRANSLATION_NAMESPACE}:${error.message}`) ? (
                <ApolloErrorAlert error={error} />
              ) : (
                <AlertError message={t(error.message)} />
              )}
            </Box>
          )}
          <Alert
            severity="warning"
            sx={{
              alignItems: 'center',
              fontSize: (theme) => theme.typography.body1.fontSize,
            }}
          >
            <b>
              {t('whenDeletingYourAccount')}
              <ul>
                <li>{t('yourDataWillBePermanentlyDeleted')}</li>
                <li>{t('ifYouAreAVendor')}</li>
                <li>{t('ifYouAreAGroupAdmin')}</li>
              </ul>
            </b>
          </Alert>
          <Box mt={2}>
            {t('enterYourPAsswordHere')}
            <Box mt={1}>
              <TextField
                variant="outlined"
                name={'password'}
                label={t('password')}
                value={password}
                onChange={onPasswordChange}
                type="password"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onCancel}>
            {t('keepMyAccount')}
          </Button>
          <LoadingButton
            loading={loading}
            variant="outlined"
            onClick={onDeleteAccount}
            disabled={!password}
            color="error"
          >
            {t('definitelyDeleteMyAccount')}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteAccountModule;
