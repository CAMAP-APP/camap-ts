import { TableCell, TableBody, TableRow, Checkbox } from '@mui/material';
import { Skeleton } from '@mui/material';
import React from 'react';
import { DEFAULT_NUMBER_OF_ROW_PER_PAGE } from './MembersTableTitleAndPagination';

interface MembersTableSkeletonProps {
  count: number | undefined;
  nbOfColumn: number;
  hasCheckbox?: boolean;
}

const MembersTableSkeleton = ({ count, nbOfColumn, hasCheckbox = false }: MembersTableSkeletonProps) => {
  const rows = [];
  const maxIndex = count ? Math.min(DEFAULT_NUMBER_OF_ROW_PER_PAGE, count) : DEFAULT_NUMBER_OF_ROW_PER_PAGE;
  for (let i = 0; i < maxIndex; i++) {
    const columns = [];
    for (let j = 0; j < nbOfColumn; j++) {
      columns.push(
        <TableCell key={`${i}${j}`}>
          <Skeleton variant="text" />
        </TableCell>,
      );
    }
    rows.push(
      <TableRow key={i}>
        {hasCheckbox && (
          <TableCell padding="checkbox">
            <Checkbox disabled />
          </TableCell>
        )}
        {columns}
      </TableRow>,
    );
  }
  return <TableBody>{rows}</TableBody>;
};

export default MembersTableSkeleton;
