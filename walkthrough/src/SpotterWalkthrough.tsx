import React from 'react';
import { Series } from 'remotion';
import { IntroScene } from './scenes/IntroScene';
import { RequirementsScene } from './scenes/RequirementsScene';
import { RiskMatrixScene } from './scenes/RiskMatrixScene';
import { RankingScene } from './scenes/RankingScene';
import { DashboardScene } from './scenes/DashboardScene';
import { TestingScene } from './scenes/TestingScene';

export const SpotterWalkthrough: React.FC = () => {
  return (
    <Series>
      {/* Scene 1: Title & Overview (3.0s) */}
      <Series.Sequence durationInFrames={72}>
        <IntroScene />
      </Series.Sequence>

      {/* Scene 2: Core Routing & ETA Foundation (3.5s) */}
      <Series.Sequence durationInFrames={84}>
        <RequirementsScene />
      </Series.Sequence>

      {/* Scene 3: Exact Weather Risk Matrix & Load Overrides (4.5s) */}
      <Series.Sequence durationInFrames={108}>
        <RiskMatrixScene />
      </Series.Sequence>

      {/* Scene 4: Lexicographical Route Recommendation & Voronoi Math (4.0s) */}
      <Series.Sequence durationInFrames={96}>
        <RankingScene />
      </Series.Sequence>

      {/* Scene 5: Transportation Dashboard UI & 0-48h Heatmap (4.5s) */}
      <Series.Sequence durationInFrames={108}>
        <DashboardScene />
      </Series.Sequence>

      {/* Scene 6: Automated Testing & GitHub Submission (3.5s) */}
      <Series.Sequence durationInFrames={84}>
        <TestingScene />
      </Series.Sequence>
    </Series>
  );
};
