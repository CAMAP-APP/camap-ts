import {
  Card,
  CardContent,
  CardHeader,
  CardProps,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import React, { PropsWithChildren } from 'react';

interface BlockProps {
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  headerAction?: React.ReactNode;
}

function Block({
  title,
  icon,
  sx,
  headerSx,
  contentSx,
  children,
  elevation,
  headerAction,
}: PropsWithChildren<BlockProps> & Pick<CardProps, 'elevation'>) {
  return (
    <Card sx={sx} elevation={elevation}>
      {title && (
        <CardHeader
          sx={{
            backgroundColor: (theme) => theme.palette.action.selected,
            ...headerSx,
          }}
          avatar={icon}
          title={
            typeof title === 'string' ? (
              <Typography variant="h4">{title}</Typography>
            ) : (
              title
            )
          }
          action={headerAction}
        />
      )}
      <CardContent sx={contentSx}>{children}</CardContent>
    </Card>
  );
}

export default Block;
