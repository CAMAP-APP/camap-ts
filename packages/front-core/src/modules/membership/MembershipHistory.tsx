import { ApolloError } from '@apollo/client';
import { Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Colors } from '@theme/commonPalette';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import { useDeleteMembershipMutation } from '../../gql';

const HeadTableCellSx = {
  backgroundColor: Colors.background3,
  fontWeight: 900,
};

interface MembershipHistoryProps {
  isLocked: boolean;
  userId: number;
  groupId: number;
  memberships: Array<{
    name: string;
    date: Date;
    year: number;
    amount: number;
  }>;
  onDelete: () => void;
  onDeleteComplete: (success: boolean) => void;
}

const MembershipHistory = ({
  isLocked,
  userId,
  groupId,
  memberships,
  onDelete,
  onDeleteComplete,
}: MembershipHistoryProps) => {
  const { t } = useTranslation(['membership/default']);
  const { t: tBasics } = useTranslation(['translation']);

  const [yearToDelete, setYearToDelete] = React.useState<number>();
  const [gqlError, setGqlError] = React.useState<ApolloError | undefined>(
    undefined,
  );

  const [deleteMembership] = useDeleteMembershipMutation();

  const dialogIsOpened = yearToDelete !== undefined;

  const closeDialog = () => {
    setYearToDelete(undefined);
  };

  const handleDelete = async () => {
    closeDialog();
    if (!yearToDelete) return;
    onDelete();
    setGqlError(undefined);

    try {
      await deleteMembership({
        variables: {
          userId,
          groupId,
          year: yearToDelete,
        },
      });
      onDeleteComplete(true);
    } catch (e) {
      setGqlError(e);
      onDeleteComplete(false);
    }
  };

  return (
    <>
      <Collapse in={gqlError !== undefined}>
        <Box m={2}>{gqlError && <ApolloErrorAlert error={gqlError} />}</Box>
      </Collapse>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={HeadTableCellSx} align="center">
              {t('year')}
            </TableCell>
            <TableCell sx={HeadTableCellSx} align="center">
              {t('subscribDate')}
            </TableCell>
            <TableCell sx={HeadTableCellSx} align="center">
              {t('amount')}
            </TableCell>
            <TableCell sx={HeadTableCellSx} align="center" />
          </TableRow>
        </TableHead>
        <TableBody>
          {memberships.length === 0 ? (
            <TableRow>
              <TableCell align="center" colSpan={4}>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ fontStyle: 'italic' }}
                >
                  {t('noMembership')}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            memberships.map((row) => {
              const onClick = () => {
                setYearToDelete(row.year);
              };

              return (
                <TableRow key={row.year}>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">
                    {format(new Date(row.date), 'd MMMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell align="center">
                    {row.amount}
                    &nbsp;&euro;
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      disabled={isLocked}
                      onClick={onClick}
                      size="large"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <Dialog open={dialogIsOpened} onClose={closeDialog}>
        <DialogTitle>{t('deleteSubscription')}</DialogTitle>
        <DialogActions>
          <Button onClick={closeDialog}>{tBasics('cancel')}</Button>
          <Button variant="contained" onClick={handleDelete}>
            {tBasics('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MembershipHistory;
