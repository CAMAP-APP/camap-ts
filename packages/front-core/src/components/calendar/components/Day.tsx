import { Box, IconButton, Typography } from '@mui/material';
import { CalendarSize } from './CalendarMonthHeader';

interface DayProps {
  filled?: boolean;
  outlined?: boolean;
  highlighted?: boolean;
  encircled?: boolean;
  disabled?: boolean;
  startOfRange?: boolean;
  endOfRange?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  value: number | string;
  size?: CalendarSize;
  isClickable?: boolean;
}

const Day = ({
  startOfRange,
  endOfRange,
  disabled,
  highlighted,
  encircled,
  outlined,
  filled,
  onClick,
  onHover,
  value,
  size = 'normal',
  isClickable = true,
}: DayProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        borderRadius: startOfRange
          ? '50% 0 0 50%'
          : endOfRange
          ? '0 50% 50% 0'
          : undefined,
        backgroundColor: (theme) =>
          !disabled && highlighted ? theme.palette.primary.light : undefined,
      }}
    >
      <IconButton
        sx={{
          height: size === 'small' ? 24 : 36,
          width: size === 'small' ? 24 : 36,
          padding: 0,
          border: (theme) =>
            !disabled && outlined
              ? `1px solid ${theme.palette.primary.dark}`
              : !disabled && encircled
              ? `2px dotted ${theme.palette.common.black}`
              : undefined,
          ...(!disabled && filled && encircled
            ? {
                borderColor: (theme) => theme.palette.primary.contrastText,
              }
            : {}),
          ...(!disabled && filled
            ? {
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
                backgroundColor: (theme) => theme.palette.primary.dark,
              }
            : {}),
        }}
        disabled={disabled || !isClickable}
        onClick={onClick}
        onMouseOver={onHover}
      >
        <Typography
          sx={{
            fontSize: size === 'small' ? '0.8rem' : 'initial',
            lineHeight: size === 'small' ? 1 : 1.6,
            color: (theme) =>
              !disabled
                ? filled
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary
                : theme.palette.text.secondary,
          }}
          variant="body2"
        >
          {value}
        </Typography>
      </IconButton>
    </Box>
  );
};

export default Day;
