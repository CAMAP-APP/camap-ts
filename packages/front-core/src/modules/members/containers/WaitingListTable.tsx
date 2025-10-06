import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React, { ReactChild } from 'react';
import { useGetWaitingListsOfGroupQuery, WaitingList } from '../../../gql';
import { Order } from '../../../utils/table';
import MembersEmptyTable from '../components/MembersEmptyTable';
import MembersTableBody, {
  DefaultFormattedMember,
} from '../components/MembersTableBody';
import MembersTableHeader from '../components/MembersTableHeader';
import MembersTableSkeleton from '../components/MembersTableSkeleton';
import MembersTableTitleAndPagination, {
  DEFAULT_NUMBER_OF_ROW_PER_PAGE,
} from '../components/MembersTableTitleAndPagination';
import MembersTableToolbar from '../components/MembersTableToolbar';
import WaitingListButtons from '../components/WaitingListButtons';
import { MembersContext } from '../MembersContext';
import { formatCoupleName } from 'camap-common';

interface FormattedWaitingListMember extends DefaultFormattedMember {
  details: string;
  registrationDate: Date;
  message: string;
  ' ': ReactChild;
}

function formatMember(
  waitingList: Pick<WaitingList, 'date' | 'message' | 'user'>,
): FormattedWaitingListMember {
  const member = waitingList.user;
  return {
    id: member.id,
    names: formatCoupleName(member),
    details: member.phone ? `${member.email} ${member.phone}` : member.email,
    registrationDate: waitingList.date,
    message: waitingList.message,
    ' ': <WaitingListButtons userId={member.id} />,
  };
}

type HeadCellType = keyof FormattedWaitingListMember;
const headCells: HeadCellType[] = [
  'names',
  'details',
  'registrationDate',
  'message',
  ' ',
];

function WaitingListTable() {
  const { groupId, toggleRefetch, selectedUserList } =
    React.useContext(MembersContext);

  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] =
    React.useState<keyof FormattedWaitingListMember>('names');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    DEFAULT_NUMBER_OF_ROW_PER_PAGE,
  );

  const {
    data: waitingListData,
    loading: waitingListLoading,
    error: waitingListError,
    refetch: waitingListRefetch,
  } = useGetWaitingListsOfGroupQuery({ variables: { groupId } });

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    if (waitingListRefetch) waitingListRefetch();
  }, [toggleRefetch]);

  const formattedMembers: FormattedWaitingListMember[] = React.useMemo(() => {
    return waitingListData
      ? waitingListData.getWaitingListsOfGroup.map((wl) =>
          formatMember(wl as Pick<WaitingList, 'date' | 'message' | 'user'>),
        )
      : [];
  }, [waitingListData]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof FormattedWaitingListMember,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (waitingListError) return <ApolloErrorAlert error={waitingListError} />;

  return (
    <Box width="100%" mb={2}>
      <MembersTableToolbar selectedIds={[]} members={[]} />
      <MembersTableTitleAndPagination
        count={formattedMembers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <TableContainer sx={{ overflowX: 'initial' }}>
        <Table
          aria-labelledby="membersTableTitle"
          aria-label="waiting list table"
          size="small"
          sx={{ tableLayout: 'fixed' }}
        >
          <MembersTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            headCells={headCells}
          />
          {waitingListLoading && selectedUserList.count !== 0 && (
            <MembersTableSkeleton
              count={selectedUserList.count || undefined}
              nbOfColumn={headCells.length}
            />
          )}
          {!waitingListLoading && formattedMembers.length > 0 && (
            <MembersTableBody
              formattedMembers={formattedMembers}
              page={page}
              rowsPerPage={rowsPerPage}
              order={order}
              orderBy={orderBy}
              headCells={headCells}
            />
          )}
        </Table>
        <MembersEmptyTable
          show={
            (!waitingListLoading && formattedMembers.length === 0) ||
            selectedUserList.count === 0
          }
        />
      </TableContainer>
    </Box>
  );
}

export default WaitingListTable;
