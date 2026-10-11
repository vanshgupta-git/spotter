import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RouteList } from '../components/RouteList';
import type { RouteOption } from '../types';

const mockRoutes: RouteOption[] = [
  {
    id: 'route-1',
    name: 'I-80 E Direct',
    summary: 'I-80 E',
    distance_meters: 1200000,
    distance_miles: 745.6,
    duration_seconds: 43200,
    duration_hours: 12.0,
    coordinates: [[-87.6298, 41.8781], [-74.0060, 40.7128]],
    checkpoints: [],
    rank: 1,
    is_recommended: true,
    recommendation_badge: 'RECOMMENDED',
    recommendation_explanation: 'Safest corridor with 0 Severe miles.',
    risk_summary: {
      severe_miles: 0,
      high_miles: 15.2,
      moderate_miles: 120,
      low_miles: 610.4,
      no_travel_miles: 0,
      average_risk: 1.45,
      has_no_travel: false,
      has_incomplete_weather: false,
      total_distance_miles: 745.6,
    },
  },
  {
    id: 'route-2',
    name: 'I-76 E Alternate',
    summary: 'I-76 E',
    distance_meters: 1250000,
    distance_miles: 776.7,
    duration_seconds: 46800,
    duration_hours: 13.0,
    coordinates: [[-87.6298, 41.8781], [-74.0060, 40.7128]],
    checkpoints: [],
    rank: 2,
    is_recommended: false,
    recommendation_badge: 'ALTERNATIVE #2',
    recommendation_explanation: 'Alternative corridor with 8.5 Severe miles.',
    risk_summary: {
      severe_miles: 8.5,
      high_miles: 45.0,
      moderate_miles: 150,
      low_miles: 573.2,
      no_travel_miles: 0,
      average_risk: 1.88,
      has_no_travel: false,
      has_incomplete_weather: false,
      total_distance_miles: 776.7,
    },
  },
];

describe('RouteList Component', () => {
  it('renders route cards with distance, duration, and recommendation badges', () => {
    const handleSelect = vi.fn();
    render(
      <RouteList
        routes={mockRoutes}
        selectedRouteId="route-1"
        onSelectRoute={handleSelect}
        overallAdvice="Route 1 is recommended for minimal wind shear."
        recommendationStatus="RECOMMENDED_SAFE"
      />
    );

    expect(screen.getByText(/I-80 E Direct/i)).toBeInTheDocument();
    expect(screen.getByText(/I-76 E Alternate/i)).toBeInTheDocument();
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
    expect(screen.getByText(/ALTERNATIVE #2/i)).toBeInTheDocument();
    expect(screen.getByText(/745.6 miles/i)).toBeInTheDocument();
  });

  it('calls onSelectRoute when a route card is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <RouteList
        routes={mockRoutes}
        selectedRouteId="route-1"
        onSelectRoute={handleSelect}
      />
    );

    const route2Card = screen.getByText(/I-76 E Alternate/i);
    fireEvent.click(route2Card);
    expect(handleSelect).toHaveBeenCalledWith('route-2');
  });
});
