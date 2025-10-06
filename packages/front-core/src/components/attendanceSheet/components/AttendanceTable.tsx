import {
  styled,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatCurrency } from 'camap-common';
import { PropsWithChildren } from 'react';
import { Colors } from '../../../theme/commonPalette';
import {
  AttendanceBodyCell,
  AttendanceTableData,
} from '../attendanceSheet.interface';

const SMALL_CELL_HEIGHT = 20;
const BIG_CELL_HEIGHT = 80;

const OnePersonPerPageTableWrapper = styled('div')(() => {
  return {
    '@media print': {
      hr: {
        pageBreakAfter: 'always',
        border: 0,
      },
    },
    '@media screen': {
      hr: {
        border: '4px #DDD dashed',
        marginTop: 16,
        marginBottom: 16,
      },
    },
  };
});

type CellHeightType = 'small' | 'big';

export interface AttendanceTableProps {
  data: AttendanceTableData;
  cellHeight?: CellHeightType;
  formatOnePersonPerPage?: boolean;
}

const Line = ({
  sx,
  value,
  type,
}: { key: string; sx: SxProps } & (
  | { value: string; type?: 'string' | undefined }
  | { value: number; type: 'currency' | 'number' }
)) => {
  let res;
  if (type === 'currency' && typeof value === 'number') {
    res = formatCurrency(value);
  } else {
    res = value;
  }

  return (
    <Typography sx={sx} component="div">
      {res}
    </Typography>
  );
};

const StyledTable = ({
  children,
  cellHeight,
}: PropsWithChildren & { cellHeight: CellHeightType }) => (
  <Table
    sx={{
      '& thead tr th': {
        padding: 0,
        paddingLeft: 1,
        paddingRight: 1,
        border: 1,
        borderColor: 'black',
        bgcolor: (theme) => theme.palette.grey[300],
        lineHeight: (theme) => theme.typography.body2.lineHeight,
      },

      '& tbody': {
        '& tr': {
          '&:nth-of-type(even)': {
            bgcolor: (theme) => theme.palette.grey[100],
          },

          '&:last-of-type': {
            '& td': {
              border: 1,
              borderColor: 'black',
            },
          },

          '& td': {
            padding: 0,
            paddingLeft: 1,
            paddingRight: 1,
            border: 1,
            borderColor: 'black',

            ...(cellHeight === 'big'
              ? { height: BIG_CELL_HEIGHT }
              : { height: SMALL_CELL_HEIGHT }),

            '&:first-of-type': {
              border: 1,
              borderColor: 'black',
            },

            '&:last-of-type': {
              border: 1,
              borderColor: 'black',
            },
          },
        },
      },

      '& .names': {
        minWidth: 150,
      },
      '& .phone': {
        minWidth: 80,
      },
      '& .concat-contact': {
        minWidth: 200,
      },
      '& .contract': {
        minWidth: 200,
      },
    }}
  >
    {children}
  </Table>
);

export const AttendanceTable = ({
  data,
  cellHeight = 'big',
  formatOnePersonPerPage = false,
}: AttendanceTableProps) => {
  const renderTableHead = (tableIndex?: number) => (
    <TableHead>
      {tableIndex !== undefined &&
        data.tableTitles &&
        data.tableTitles[tableIndex] &&
        data.tableTitles[tableIndex]}
      <TableRow>
        {data.head.map((cell, cellIndex) => (
          <TableCell
            key={cellIndex}
            style={{ minWidth: cell.width }}
            align={cell.align}
          >
            {cell.value}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderTableRow = (row: AttendanceBodyCell[], i: number) => (
    <TableRow key={i}>
      {row.map((cell, ii) => {
        return (
          <TableCell
            key={ii}
            align={cell.align}
            colSpan={cell.colSpan}
            rowSpan={cell.rowSpan}
            sx={{
              '&.MuiTableCell-root.MuiTableCell-body.MuiTableCell-sizeMedium': {
                height: cell.alwaysSmallHeight
                  ? SMALL_CELL_HEIGHT
                  : cellHeight === 'big'
                  ? { height: BIG_CELL_HEIGHT }
                  : { height: SMALL_CELL_HEIGHT },
                border: cell.type === 'clear' ? 0 : undefined,
                bgcolor: cell.type === 'clear' ? Colors.white : undefined,
              },
            }}
          >
            {cell.type !== 'clear' &&
              (Array.isArray(cell.value) ? cell.value : [cell.value]).map(
                (value, index) => (
                  <Line
                    key={`${ii}-${index}`}
                    sx={{
                      lineHeight: cellHeight === 'big' ? 1.43 : 1,
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: cell.width || 'initial',
                    }}
                    value={value as any}
                    type={cell.type}
                  />
                ),
              )}
          </TableCell>
        );
      })}
    </TableRow>
  );

  if (formatOnePersonPerPage) {
    return (
      <>
        {data.body.map((rows, i) => (
          <OnePersonPerPageTableWrapper>
            <StyledTable cellHeight={cellHeight}>
              {renderTableHead(i)}
              <TableBody>{rows.map(renderTableRow)}</TableBody>
            </StyledTable>
            <hr />
          </OnePersonPerPageTableWrapper>
        ))}
      </>
    );
  }

  return (
    <StyledTable cellHeight={cellHeight}>
      {renderTableHead()}
      <TableBody>{data.body.map((rows) => rows.map(renderTableRow))}</TableBody>
    </StyledTable>
  );
};

export default AttendanceTable;
