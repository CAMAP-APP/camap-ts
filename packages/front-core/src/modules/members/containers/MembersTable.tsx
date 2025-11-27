import { Box } from '@mui/material';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import React from 'react';
import { User } from '../../../gql';
import {
  formatUserAddress,
} from '../../../utils/fomat';
import { Order } from '../../../utils/table';
import { goTo } from '../../../utils/url';
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
import { MembersContext } from '../MembersContext';
import Member from '../MemberType';
import { formatCoupleName } from 'camap-common';

interface FormattedMember extends DefaultFormattedMember {
  address: string;
}

function formatMember(member: Member): FormattedMember {
  return {
    id: member.id,
    names: formatCoupleName(member),
    address: formatUserAddress(member as User) || '',
  };
}

interface MembersTableProps {
  members: Member[];
  loading: boolean;
  allMembers: Member[] | undefined;
}

type HeadCellType = keyof FormattedMember;
const headCells: HeadCellType[] = ['names', 'address'];

function MembersTable({ members, loading, allMembers }: MembersTableProps) {
  const { selectedUserList, toggleRefetch } = React.useContext(MembersContext);
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<keyof FormattedMember>('names');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    DEFAULT_NUMBER_OF_ROW_PER_PAGE,
  );

  const formattedMembers: FormattedMember[] = React.useMemo(() => {
    return members.map((m) => formatMember(m));
  }, [members]);

  React.useEffect(() => {
    const { length } = members;
    if (page * rowsPerPage > length) {
      setPage(0);
    }
    setSelected([]);
  }, [members, page, rowsPerPage]);

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    setSelected([]);
  }, [toggleRefetch]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof FormattedMember,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = formattedMembers.map((m) => m.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const openMemberPage = (id: number) => {
    goTo(`/member/view/${id}`);
  };

  const selectMember = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
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

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  return (
    <Box width="100%" mb={2}>
      <MembersTableToolbar selectedIds={selected} members={members} />
      <MembersTableTitleAndPagination
        count={formattedMembers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <TableContainer
        sx={{
          overflowX: 'initial',
        }}
      >
        <Table aria-labelledby="tableTitle" aria-label="members table">
          <MembersTableHeader
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={formattedMembers.length}
            headCells={headCells}
          />
          {loading && selectedUserList.count !== 0 && (
            <MembersTableSkeleton
              count={selectedUserList.count || undefined}
              nbOfColumn={headCells.length}
              hasCheckbox
            />
          )}
          {!loading && formattedMembers.length > 0 && (
            <MembersTableBody
              formattedMembers={formattedMembers}
              page={page}
              rowsPerPage={rowsPerPage}
              order={order}
              orderBy={orderBy}
              headCells={headCells}
              isSelected={isSelected}
              handleRowClick={openMemberPage}
              handleCheckboxClick={selectMember}
            />
          )}
        </Table>
        <MembersEmptyTable
          show={
            (!loading && formattedMembers.length === 0) ||
            selectedUserList.count === 0
          }
        />
      </TableContainer>
    </Box>
  );
}

export default MembersTable;
