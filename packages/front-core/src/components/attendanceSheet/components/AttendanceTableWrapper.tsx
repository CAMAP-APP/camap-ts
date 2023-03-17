import { Box } from '@mui/material';
import React from 'react';
import theme from '../../../theme';

export interface AttendanceTableWrapperProps {
  children: React.ReactNode;
}

export const ATTENDANCE_TABLE_CONTAINER_ID = 'attendance-table-container';

const getPrintedPageMargins = () => {
  return `@page { margin: ${theme.spacing(4)} !important; }`;
};

export const AttendanceTableWrapper = ({
  children,
}: AttendanceTableWrapperProps) => {
  return (
    <Box p={4} bgcolor="#efefef" maxHeight={600} overflow="auto">
      <Box bgcolor="#fff" width="fit-content" p={2}>
        <Box id={ATTENDANCE_TABLE_CONTAINER_ID}>
          <style>{getPrintedPageMargins()}</style>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AttendanceTableWrapper;
