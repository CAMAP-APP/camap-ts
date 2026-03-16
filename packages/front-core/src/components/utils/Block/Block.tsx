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
  variant?: 'normal' | 'primary';
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  headerAction?: React.ReactNode;
  onClick?: () => void;
}

function Block({
  title,
  icon,
  variant = 'normal',
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
            backgroundColor: (theme) => variant === 'primary' ? theme.palette.primary.main : theme.palette.action.selected,
            color: (theme) => variant === 'primary' ? theme.palette.primary.contrastText : theme.palette.text.primary,
            fontSize: {
              xs: '0.7rem',
              sm: '1rem'
            },
            padding: {
              xs: 1,
              sm: 2
            },
            ...headerSx,
          }}
          avatar={icon}
          title={
            typeof title === 'string' ? (
              <Typography
                variant="h4"
                sx={{
                  fontSize: '1.25em'
                }}
              >{title}</Typography>
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
