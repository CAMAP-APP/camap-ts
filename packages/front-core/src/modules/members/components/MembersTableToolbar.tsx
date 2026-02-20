import { FetchResult } from '@apollo/client';
import { alpha, Box, Button } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import withConfirmDialog from '../../../components/utils/ConfirmDialog/withConfirmDialog';
import {
  CreateMembershipsMutation,
  MoveBackToWaitingListMutation,
  PaymentTypeId,
  RemoveUsersFromGroupError,
  RemoveUsersFromGroupMutation,
  useCreateMembershipsMutation,
  useInitMembersQuery,
  useMoveBackToWaitingListMutation,
  useRemoveUsersFromGroupMutation,
} from '../../../gql';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { MembersContext } from '../MembersContext';
import Member from '../MemberType';
import MembershipFeeDialog from './MembershipFeeDialog';
import { formatUserName } from 'camap-common';

type BatchAction = 'membership' | 'exclude' | 'waitingList';

interface MembersTableToolbarProps {
  selectedIds: number[];
  members: Member[];
}

const MembersTableToolbar = ({
  selectedIds,
  members,
}: MembersTableToolbarProps) => {
  const { t } = useTranslation(['members/default']);
  const { t: tBasics } = useTranslation(['translation']);

  const { setSuccess, setErrors, groupId, setToggleRefetch, toggleRefetch } =
    React.useContext(MembersContext);

  const { data: initData } = useInitMembersQuery({
    variables: {
      groupId,
    },
  });

  const groupPreviewMembers = initData?.groupPreviewMembers;
  const hasMembershipFee =
    groupPreviewMembers?.membershipFee &&
    groupPreviewMembers?.membershipFee > 0;
  const hasMembership = groupPreviewMembers?.hasMembership;

  const [openMembershipFeeDialog, setOpenMembershipFeeDialog] =
    React.useState(false);

  const [moveBackToWaitingListMutation] = useMoveBackToWaitingListMutation();
  const [removeUsersFromGroupMutation] = useRemoveUsersFromGroupMutation();
  const [createMembershipsMutation] = useCreateMembershipsMutation();

  const numSelected = selectedIds.length;

  const ToolbarButton = ({
    title,
    onClick,
    danger = false,
  }: {
    title: string;
    onClick: React.MouseEventHandler;
    danger?: boolean;
  }) => (
    <Button
      variant="contained"
      disableElevation
      size="small"
      color={danger ? 'error' : 'primary'}
      sx={{
        whiteSpace: 'nowrap',
        marginBottom: {
          xs: 1,
          md: 0,
        },
      }}
      onClick={onClick}
    >
      {title}
    </Button>
  );

  const cancelButtonLabel = React.useMemo(() => tBasics('cancel'), [tBasics]);
  const confirmButtonLabel = React.useMemo(() => tBasics('confirm'), [tBasics]);

  const MembershipActionButton = withConfirmDialog(ToolbarButton, {
    title: t(`membershipConfirmDialogTitle`),
    cancelButtonLabel,
    confirmButtonLabel,
    message: t(`membershipConfirmDialogContent`),
  });

  const WaitingListActionButton = withConfirmDialog(ToolbarButton, {
    title: t(`waitingListConfirmDialogTitle`, {
      nbOfMembers: numSelected,
      count: numSelected,
    }),
    cancelButtonLabel,
    confirmButtonLabel,
    message: t(`waitingListConfirmDialogContent`, {
      nbOfMembers: numSelected,
      count: numSelected,
    }),
  });

  const ExcludeActionButton = withConfirmDialog(ToolbarButton, {
    title: t(`excludeConfirmDialogTitle`, {
      nbOfMembers: numSelected,
      count: numSelected,
    }),
    cancelButtonLabel,
    confirmButtonLabel,
    message: t(`excludeConfirmDialogContent`, {
      nbOfMembers: numSelected,
      count: numSelected,
    }),
  });

  const getMembershipPromise = (fee?: number) => {
    const date = new Date();
    return createMembershipsMutation({
      variables: {
        input: {
          userIds: selectedIds,
          groupId,
          date,
          paymentType: PaymentTypeId.check,
          membershipFee: fee,
        },
      },
    });
  };

  const awaitPromise = async <
    T extends
    | FetchResult<MoveBackToWaitingListMutation>
    | FetchResult<RemoveUsersFromGroupMutation>
    | FetchResult<CreateMembershipsMutation>,
  >(
    promise: Promise<T>,
    action: BatchAction,
  ) => {
    promise
      .then((results) => {
        if (results.errors) {
          setErrors(results.errors.map((e) => t(e.message)));
        } else if (results.data) {
          let data: any;
          if ('removeUsersFromGroup' in results.data) {
            data = results.data.removeUsersFromGroup;
          } else if ('moveBackToWaitingList' in results.data) {
            data = results.data.moveBackToWaitingList;
          } else if ('createMemberships' in results.data) {
            data = results.data.createMemberships;
          }
          if (data) {
            setErrors(
              data.errors.map((e: RemoveUsersFromGroupError) => {
                const user = members.find((m) => m.id === e.userId);
                return t(e.message, {
                  name: user && formatUserName(user),
                });
              }),
            );
            const count = data.success.length;
            if (count > 0) {
              setSuccess(
                t(`${action}SuccessMessage`, {
                  count,
                  nbMembre: count,
                }),
              );
              setToggleRefetch(!toggleRefetch);
            }
          }
        }
      })
      .catch((e) => {
        setErrors([t(e.message)]);
      });
  };

  const doBatchAction = async (action: BatchAction) => {
    setSuccess(undefined);
    setErrors([]);
    if (action === 'waitingList') {
      awaitPromise(
        moveBackToWaitingListMutation({
          variables: {
            userIds: selectedIds,
            groupId,
            message: t('waitingListDefaultMessage', {
              name: initData?.me && formatUserName(initData.me),
              date: formatAbsoluteDate(new Date(), true),
            }),
          },
        }),
        action,
      );
    } else if (action === 'exclude') {
      awaitPromise(
        removeUsersFromGroupMutation({
          variables: {
            userIds: selectedIds,
            groupId,
          },
        }),
        action,
      );
    } else if (action === 'membership') {
      if (!hasMembershipFee) {
        setOpenMembershipFeeDialog(true);
      } else {
        awaitPromise(getMembershipPromise(), action);
      }
    }
  };

  const handleCancelMembershipFeeDialog = () => {
    setOpenMembershipFeeDialog(false);
  };

  const handleConfirmMembershipFeeDialog = (fee: number) => {
    awaitPromise(getMembershipPromise(fee), 'membership');
    setOpenMembershipFeeDialog(false);
  };

  return (
    <Toolbar
      sx={{
        display: numSelected > 0 ? undefined : 'none',
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        }),
        flexWrap: 'wrap',
        gap: {
          xs: 0,
          md: 1
        },
        flexFlow: {
          xs: 'column nowrap',
          md: 'row nowrap',
        },
        alignItems: {
          xs: 'stretch',
          md: 'center',
        },
      }}
    >
      {numSelected > 0 && (<>
        <Typography
          sx={{
            flex: '1 0 auto',
            mr: 'auto',
            marginBottom: {
              xs: 1,
              md: 0,
            }
          }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {`${numSelected} ${t('selected', { count: numSelected })}`}
        </Typography>
        <Box
          flex='1 0 auto'
          display='grid'
          sx={{
            gridAutoColumns: 'auto',
            gridAutoFlow: {
              xs: 'row',
              sm: 'column',
            },
            gridAutoRows: 'auto',
            rowGap: 0,
            columnGap: 1,
          }}
        >
          <Button
            variant='outlined'
            disableElevation
            size="small"
            sx={{
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              marginBottom: {
                xs: 1,
                md: 0,
              },
            }}
            href={`/messages?${selectedIds.map(id => `to_uid=${id}`).join('&')}`}
          >{t('sendEmail')}</Button>
          {hasMembership && (
            <MembershipActionButton
              title={t('enterMembership')}
              onClick={() => doBatchAction('membership')}
            />
          )}
          <WaitingListActionButton
            title={t('resetInWaitingList')}
            onClick={() => doBatchAction('waitingList')}
          />
          <ExcludeActionButton
            title={t('removeFromGroup')}
            onClick={() => doBatchAction('exclude')}
            danger
          />
          {!hasMembershipFee && (
            <MembershipFeeDialog
              open={openMembershipFeeDialog}
              onCancel={handleCancelMembershipFeeDialog}
              onConfirm={handleConfirmMembershipFeeDialog}
            />
          )}
        </Box>
      </>
      )}
    </Toolbar>
  );
};

export default MembersTableToolbar;
