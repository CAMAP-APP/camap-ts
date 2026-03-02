import { Checkbox, TableBody, TableCell, TableRow } from '@mui/material';
import React, { ReactChild, ReactNode } from 'react';
import { formatAbsoluteDate } from '../../../utils/fomat';
import { Order, stableSort } from '../../../utils/table';

export interface DefaultFormattedMember {
  names: string;
  id: number;
}

type MemberTableFields<Headers extends string> = { [field in Headers]: string | Date | ReactNode };
interface MembersTableBodyProps<Headers extends string, T extends DefaultFormattedMember & MemberTableFields<Headers>> {
  formattedMembers: T[];
  order: Order;
  orderBy: Headers;
  rowsPerPage: number;
  page: number;
  headCells: Headers[];
  isSelected?: (id: number) => boolean;
  handleRowClick?: (id: number) => void;
  handleCheckboxClick?: (id: number) => void;
}

const MembersTableBody = <H extends string, T extends DefaultFormattedMember & MemberTableFields<H>>({
  formattedMembers,
  order,
  orderBy,
  page,
  rowsPerPage,
  headCells,
  isSelected = undefined,
  handleRowClick = undefined,
  handleCheckboxClick = undefined,
}: MembersTableBodyProps<H, T>) => {
  return (
    <TableBody>
      {stableSort(formattedMembers, order, orderBy)
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row: T, index) => {
          const hasCheckbox = isSelected !== undefined;
          const checkboxLabelId = hasCheckbox
            ? `members-table-checkbox-${index}`
            : '';
          const isItemSelected = isSelected && isSelected(row.id);

          const cells: ReactChild[] = [];
          headCells.forEach((cell, cellIndex) => {
            let idProp = {};
            if (hasCheckbox && cellIndex === 0)
              idProp = { id: checkboxLabelId };
            cells.push(
              <TableCell
                key={`${row.id}${String(cell)}`}
                {...idProp}
                sx={{
                  wordBreak: 'break-word',
                }}
              >
                {
                  (typeof row[cell] === 'object' && row[cell] instanceof Date)
                    ? formatAbsoluteDate(row[cell] as unknown as Date, true, true, true)
                    : row[cell]
                }
              </TableCell>,
            );
          });

          let rowProps = {};
          if (hasCheckbox) {
            rowProps = {
              'aria-checked': isItemSelected,
              selected: isItemSelected,
            };
          }

          if (handleRowClick) {
            rowProps = {
              ...rowProps,
              role: 'link',
              onClick: () => handleRowClick(row.id),
              sx: {
                cursor: 'pointer',
              },
            };
          }

          return (
            <TableRow hover tabIndex={-1} key={row.id} {...rowProps}>
              {hasCheckbox && (
                <TableCell
                  padding="checkbox"
                  onClick={(event) => {
                    handleCheckboxClick!(row.id);
                    event.stopPropagation();
                  }}
                >
                  <Checkbox
                    checked={isItemSelected}
                    inputProps={
                      hasCheckbox ? { 'aria-labelledby': checkboxLabelId } : {}
                    }
                  />
                </TableCell>
              )}
              {cells}
            </TableRow>
          );
        })}
    </TableBody>
  );
};
export default MembersTableBody;
