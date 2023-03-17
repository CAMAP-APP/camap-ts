import {
  Box,
  Grid,
  TablePagination,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';
import { formatUserList } from '../../../utils/fomat';
import { MembersContext } from '../MembersContext';

interface MemberTableTitleAndPaginationProps {
  count: number;
  rowsPerPage: number;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangePage: (_event: unknown, newPage: number) => void;
  page: number;
}

export const DEFAULT_NUMBER_OF_ROW_PER_PAGE = 10;

const MembersTableTitleAndPagination = ({
  count,
  rowsPerPage,
  page,
  handleChangeRowsPerPage,
  handleChangePage,
}: MemberTableTitleAndPaginationProps) => {
  const { t } = useTranslation(['members/lists']);

  const { selectedUserList } = React.useContext(MembersContext);

  const isDownSm = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container>
      <Grid
        item
        sm
        xs={12}
        sx={{
          maxWidth: 'fit-content',
        }}
      >
        <Box height="100%" display="flex" alignItems="center">
          <Typography
            sx={{
              flex: '1 1 100%',
              paddingLeft: theme.spacing(2),
            }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {formatUserList(selectedUserList, t)}
          </Typography>
        </Box>
      </Grid>
      <Grid item sm xs={12}>
        <TablePagination
          rowsPerPageOptions={[5, DEFAULT_NUMBER_OF_ROW_PER_PAGE, 25]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page * rowsPerPage > count ? 0 : page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isDownSm ? '' : undefined}
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
              {
                m: 'inherit',
              },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default MembersTableTitleAndPagination;
