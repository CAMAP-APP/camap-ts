import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MembersEmptyTableProps {
  show: boolean;
}

const MembersEmptyTable = ({ show }: MembersEmptyTableProps) => {
  const { t } = useTranslation(['members/default']);
  if (!show) return null;
  return (
    <Box p={2} display="flex" justifyContent="center">
      <Typography variant="caption" align="center" sx={{ fontStyle: 'italic' }}>
        {t('emptyList')}
      </Typography>
    </Box>
  );
};

export default MembersEmptyTable;
