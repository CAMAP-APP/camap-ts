import { styled } from '@mui/material';
import theme from '../../theme';

type WithIsanimatedProp = {
  isanimated?: boolean;
};

const Svg = styled('svg')<WithIsanimatedProp>(({ isanimated = false }) => ({
  height: '100%',
  borderRadius: '50%',
  boxShadow: `inset 0px 0px 0px ${theme.palette.success.main}`,
  animation: `fill ${isanimated ? 0.4 : 0}s ease-in-out ${
    isanimated ? 0.4 : 0
  }s forwards, scale ${isanimated ? 0.3 : 0}s ease-in-out ${
    isanimated ? 0.9 : 0
  }s both`,

  '@keyframes scale': {
    '0%,100%': {
      transform: 'none',
    },
    '50%': {
      transform: 'scale3d(1.1, 1.1, 1)',
    },
  },
  '@keyframes fill': {
    '100%': {
      boxShadow: `inset 0px 0px 0px 30px ${theme.palette.success.main}`,
    },
  },
  '@keyframes stroke': {
    '100%': {
      strokeDashoffset: 0,
    },
  },
}));

const Circle = styled('circle')<WithIsanimatedProp>(
  ({ isanimated = false }) => ({
    strokeDasharray: 166,
    strokeDashoffset: 166,

    animation: `stroke ${
      isanimated ? 0.6 : 0
    }s cubic-bezier(0.65, 0, 0.45, 1) forward`,
  }),
);

const Path = styled('path')<WithIsanimatedProp>(({ isanimated = false }) => ({
  strokeDasharray: 40,
  strokeDashoffset: 40,

  animation: `stroke ${isanimated ? 0.3 : 0}s cubic-bezier(0.65, 0, 0.45, 1) ${
    isanimated ? 0.8 : 0
  }s forwards`,
}));

const Check = ({ isAnimated = false }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 44 44"
    strokeWidth="3.6"
    stroke="white"
    strokeMiterlimit={10}
    isanimated={isAnimated}
  >
    <Circle
      cx="22"
      cy="22"
      r="20"
      fill="none"
      strokeWidth={3.6}
      strokeMiterlimit={10}
      stroke={theme.palette.success.main}
      isanimated={isAnimated}
    />
    <g xmlns="http://www.w3.org/2000/svg" transform="matrix(1 0 0 1 21.7 21.2)">
      <Path
        transform="translate(-26, -26)"
        d="M 14.1 27.2 l 7.1 7.2 l 16.7 -16.8"
        strokeLinecap="round"
        fill="none"
        strokeWidth={3.6}
        strokeMiterlimit={10}
        isanimated={isAnimated}
      />
    </g>
  </Svg>
);

export default Check;
