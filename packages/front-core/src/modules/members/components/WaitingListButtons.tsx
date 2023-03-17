import { Check, Close } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useApproveRequestMutation,
  useCancelRequestMutation,
} from '../../../gql';
import { MembersContext } from '../MembersContext';

interface WaitingListButtonsProps {
  userId: number;
}

const WaitingListButtons = ({ userId }: WaitingListButtonsProps) => {
  const { t } = useTranslation(['members/default']);

  const { groupId, setErrors, setToggleRefetch, toggleRefetch } =
    React.useContext(MembersContext);
  const [
    cancelRequestMutation,
    { loading: cancelRequestLoading, error: cancelRequestError },
  ] = useCancelRequestMutation();
  const [
    approveRequestMutation,
    { loading: approveRequestLoading, error: approveRequestError },
  ] = useApproveRequestMutation();

  React.useEffect(() => {
    if (!approveRequestError && !cancelRequestError) return;
    setErrors([
      approveRequestError
        ? approveRequestError.message
        : cancelRequestError!.message,
    ]);
  }, [approveRequestError, cancelRequestError]);

  const approveRequest = async () => {
    await approveRequestMutation({ variables: { userId, groupId } });
    setToggleRefetch(!toggleRefetch);
  };

  const cancelRequest = async () => {
    await cancelRequestMutation({ variables: { userId, groupId } });
    setToggleRefetch(!toggleRefetch);
  };

  return (
    <Box display="flex" flexDirection="column">
      <LoadingButton
        loading={approveRequestLoading}
        variant="contained"
        color="success"
        startIcon={<Check />}
        size="small"
        onClick={approveRequest}
      >
        {t('accept')}
      </LoadingButton>
      <LoadingButton
        loading={cancelRequestLoading}
        variant="outlined"
        startIcon={<Close />}
        size="small"
        sx={{
          marginTop: 1,
        }}
        onClick={cancelRequest}
      >
        {t('refuse')}
      </LoadingButton>
    </Box>
  );
};

export default WaitingListButtons;
