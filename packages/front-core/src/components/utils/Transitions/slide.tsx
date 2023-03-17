import { SxProps } from '@mui/material';
import theme from '../../../theme';

export type SlideDirection = 'left' | 'right';

export const getSlideContainerSx = (
  nbItemsToShow: number,
  itemWidth: number,
  isAnimating?: SlideDirection,
): SxProps => ({
  '@keyframes slide-right': {
    '0%': {
      transform: 'translateX(0)',
    },
    '100%': {
      transform: `translateX(calc((100% - ${nbItemsToShow} * ${itemWidth}px) / ${
        nbItemsToShow + 1
      } + ${itemWidth}px))`,
    },
  },

  '@keyframes slide-left': {
    '0%': {
      transform: 'translateX(0)',
    },
    '100%': {
      transform: `translateX(calc((100% - ${nbItemsToShow} * ${itemWidth}px) / -${
        nbItemsToShow + 1
      } - ${itemWidth}px))`,
    },
  },

  animationDuration: `${theme.transitions.duration.short}ms`,
  animationName: isAnimating
    ? isAnimating === 'right'
      ? 'slide-right'
      : 'slide-left'
    : '',
});

export const getSlideItemSx = (
  nbItemsToShow: number,
  itemWidth: number,
  firstShowingItem: number,
  totalNbItems: number,
): SxProps => ({
  '&:first-child':
    firstShowingItem > 0
      ? {
          position: 'absolute',
          left: -itemWidth,
        }
      : {},
  '&:last-child':
    firstShowingItem + nbItemsToShow < totalNbItems
      ? {
          position: 'absolute',
          right: -itemWidth,
        }
      : {},
});
