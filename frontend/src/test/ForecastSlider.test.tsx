import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForecastSlider } from '../components/ForecastSlider';

describe('ForecastSlider Component', () => {
  it('renders slider with current offset and jumps to +12h', () => {
    const handleChange = vi.fn();
    const handleToggleMode = vi.fn();

    render(
      <ForecastSlider
        hourOffset={6}
        onChangeHourOffset={handleChange}
        baseDepartureTime="2026-10-11T12:00:00Z"
        isTimelineMode={false}
        onToggleTimelineMode={handleToggleMode}
      />
    );

    expect(screen.getByText(/Corridor Weather Forecast Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/T\+6 Hours/i)).toBeInTheDocument();

    const jump12Btn = screen.getByRole('button', { name: /\+12h/i });
    fireEvent.click(jump12Btn);
    expect(handleChange).toHaveBeenCalledWith(12);
  });

  it('toggles between ETA mode and corridor heatmap mode', () => {
    const handleChange = vi.fn();
    const handleToggleMode = vi.fn();

    render(
      <ForecastSlider
        hourOffset={0}
        onChangeHourOffset={handleChange}
        baseDepartureTime="2026-10-11T12:00:00Z"
        isTimelineMode={false}
        onToggleTimelineMode={handleToggleMode}
      />
    );

    const heatmapBtn = screen.getByText(/Corridor Heatmap/i);
    fireEvent.click(heatmapBtn);
    expect(handleToggleMode).toHaveBeenCalledWith(true);
  });
});
