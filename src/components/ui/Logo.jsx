import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme';

export function Logo({ size = 64 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Protective shield */}
      <Path
        d="M32 4L10 13V30C10 44.5 19.4 56.2 32 60C44.6 56.2 54 44.5 54 30V13L32 4Z"
        fill={colors.primary}
      />
      {/* Subtle nest cradle arc */}
      <Path
        d="M19 41C22.5 45.5 27 47.5 32 47.5C37 47.5 41.5 45.5 45 41"
        stroke={colors.surface}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Heart inside shield */}
      <Path
        d="M32 39C32 39 21 32.2 21 24.5C21 21.1 23.7 18.5 27 18.5C29.1 18.5 31 19.6 32 21.3C33 19.6 34.9 18.5 37 18.5C40.3 18.5 43 21.1 43 24.5C43 32.2 32 39 32 39Z"
        fill={colors.white}
      />
    </Svg>
  );
}
