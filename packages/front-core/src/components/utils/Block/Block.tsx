import {
  Card,
  CardActionArea,
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
  onClick?: () => void;
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
  onClick
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
      {onClick && <CardActionArea onClick={onClick}>
        <CardContent sx={contentSx}>{children}</CardContent>
      </CardActionArea>}
      {!onClick && <CardContent sx={contentSx}>{children}</CardContent>}
    </Card>
  );
}

export default Block;
