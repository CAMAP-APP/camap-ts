import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { Empty } from '../../../../components/Empty';
import withConfirmDialog from '../../../../components/utils/ConfirmDialog/withConfirmDialog';
import ApolloErrorAlert from '../../../../components/utils/errors/ApolloErrorAlert';
import {
  Group,
  useQuitGroupMutation,
  User,
  UserAccountDocument,
  UserAccountQuery,
} from '../../../../gql';
import { useCamapTranslation } from '../../../../utils/hooks/use-camap-translation';
import { goTo } from '../../../../utils/url';
import QuitGroupContent from '../../QuitGroup/components/QuitGroupContent';

export interface UserGroupsProps {
  groups: Pick<Group, 'id' | 'name'>[];
  user: Pick<User, 'email' | 'email2'>;
  currentGroupId?: number;
}

const UserGroups = ({ groups, user, currentGroupId }: UserGroupsProps) => {
  const { t, tBasics } = useCamapTranslation({
    tLogin: 'users/account',
    tBasics: 'translation',
  });

  const [quitGroupMutation, { error }] = useQuitGroupMutation({
    update: (cache, { data: mutationData }) => {
      const deletedGroupId = mutationData?.quitGroup.groupId;

      let userAccountQueryData = cache.readQuery<UserAccountQuery>({
        query: UserAccountDocument,
      });

      if (!userAccountQueryData) return;

      const copy = { ...userAccountQueryData };

      copy.myGroups = userAccountQueryData.myGroups.filter((g) => {
        return g.id !== deletedGroupId;
      });
      cache.writeQuery({
        query: UserAccountDocument,
        data: copy,
      });

      if (currentGroupId === deletedGroupId) {
        if (process.env.NODE_ENV === 'production') {
          // eslint-disable-next-line no-underscore-dangle
          window._Camap.resetGroupInSession(deletedGroupId);
        }
        goTo('/user/choose?show=1');
      }
    },
  });

  if (!groups.length) {
    return <Empty text={t('emptyList')} />;
  }

  return (
    <TableContainer>
      <Box maxHeight={736}>
        {error && (
          <Box p={2} pb={0}>
            <ApolloErrorAlert error={error} />
          </Box>
        )}
        <Table>
          <TableBody>
            {groups.map((group) => {
              const QuitGroupButton = withConfirmDialog(Button, {
                title: t('quitGroupDialogTitle', { groupName: group.name }),
                content: <QuitGroupContent user={user} />,
                cancelButtonLabel: tBasics('cancel'),
                confirmButtonLabel: t('quitGroup'),
                useBigTitle: true,
              });

              const onClick = () =>
                try {
                quitGroupMutation({ variables: { groupId: group.id } });
                catch (e) {
                  throw (e);
                }

                return (
                  <TableRow key={group.id}>
                    <TableCell component="th" scope="row">
                      {group.name}
                    </TableCell>
                    <TableCell align="right">
                      <QuitGroupButton variant="outlined" onClick={onClick}>
                        {t('quitGroup')}
                      </QuitGroupButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Box>
    </TableContainer>
  );
};

export default UserGroups;
