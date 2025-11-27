import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../../utils/table';

interface MembersTableHeaderProps<T> {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  order: Order;
  orderBy: string;
  headCells: (keyof T)[];
  rowCount?: number;
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  numSelected?: number;
}

const MembersTableHeader = <T extends object>({
  order,
  orderBy,
  onRequestSort,
  headCells,
  rowCount,
  numSelected,
  onSelectAllClick,
}: MembersTableHeaderProps<T>) => {
  const { t } = useTranslation(['members/default']);
  const createSortHandler =
    (property: keyof T) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {numSelected !== undefined &&
          onSelectAllClick !== undefined &&
          rowCount !== undefined && (
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{ 'aria-label': t('selectAll') }}
              />
            </TableCell>
          )}
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.toString()}
            sortDirection={orderBy === headCell ? order : false}
            sx={
              (headCells.length === 2) ? {
                width: '50%',
              } : undefined
            }
          >
            <TableSortLabel
              active={orderBy === headCell}
              direction={orderBy === headCell ? order : 'asc'}
              onClick={createSortHandler(headCell)}
            >
              {t(headCell.toString())}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default MembersTableHeader;
