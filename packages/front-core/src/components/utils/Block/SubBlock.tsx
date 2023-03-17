import { SxProps, Theme } from '@mui/material';
import { PropsWithChildren } from 'react';
import Block from './Block';

interface SubBlockProps {
  title?: string;
  sx?: SxProps;
  headerSx?: SxProps;
  contentSx?: SxProps;
}

function SubBlock({
  title,
  sx,
  headerSx,
  contentSx,
  children,
}: PropsWithChildren<SubBlockProps>) {
  return (
    <Block
      title={title}
      headerSx={{
        textAlign: 'center',
        '& h4': {
          fontSize: (theme: Theme) => theme.typography.h5.fontSize,
        },
        ...headerSx,
      }}
      contentSx={{
        p: {
          xs: 1,
          sm: 2,
        },
        '&:last-child': {
          p: {
            xs: 1,
            sm: 2,
          },
        },
        ...contentSx,
      }}
      sx={{
        border: 4,
        borderColor: (theme: Theme) => theme.palette.action.selected,
        borderRadius: 2,
        boxSizing: 'border-box',
        ...sx,
      }}
      elevation={0}
    >
      {children}
    </Block>
  );
}

export default SubBlock;
