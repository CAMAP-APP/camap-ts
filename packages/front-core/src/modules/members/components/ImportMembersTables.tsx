import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

interface ImportMembersTablesProps {
  users: string[][];
  headers: string[];
}

const ImportMembersTables = ({ users, headers }: ImportMembersTablesProps) => {
  return (
    <Table padding="checkbox" size="small">
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user, index) => {
          return (
            <TableRow hover tabIndex={-1} key={`${index}_${user[2]}`}>
              {user.map((userProp, index) => (
                <TableCell
                  key={`${headers[index]}_${userProp}`}
                  sx={{ wordBreak: 'break-word' }}
                >
                  {userProp}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default ImportMembersTables;
