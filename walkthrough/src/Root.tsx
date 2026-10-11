import React from 'react';
import { Composition } from 'remotion';
import { SpotterWalkthrough } from './SpotterWalkthrough';
import './index.css';

export const Root: React.FC = () => {
  return (
    <Composition
      id="SpotterWalkthrough"
      component={SpotterWalkthrough}
      durationInFrames={552}
      fps={24}
      width={1280}
      height={720}
    />
  );
};
