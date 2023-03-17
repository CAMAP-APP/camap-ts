import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';

export interface TwoColumnsGridProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

const TwoColumnsGrid = ({ left, right }: TwoColumnsGridProps) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  /** */
  return (
    <Grid container spacing={matches ? 2 : 0}>
      <Grid item sm={6} xs={12}>
        {left}
      </Grid>
      <Grid item sm={6} xs={12}>
        {right}
      </Grid>
    </Grid>
  );
};

export default TwoColumnsGrid;
