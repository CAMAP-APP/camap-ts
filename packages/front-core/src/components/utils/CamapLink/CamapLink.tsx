import { alpha, Link, LinkProps } from '@mui/material';
import theme from '../../../theme';

/**
   A MUI link with Camap's dark green color
* */
const CamapLink = ({
  sx = [],
  children,
  ...linkProps
}: Omit<LinkProps, 'className'>) => {
  return (
    <Link
      sx={[
        {
          color: 'success.dark',
          textDecorationColor: alpha(theme.palette.success.dark, 0.4),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      variant="body1"
      {...linkProps}
    >
      {children}
    </Link>
  );
};

export default CamapLink;
