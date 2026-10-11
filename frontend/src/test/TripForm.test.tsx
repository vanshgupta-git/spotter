import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TripForm } from '../components/TripForm';

describe('TripForm Component', () => {
  it('renders all required input fields', () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/Origin Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Destination Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Departure Date & Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Truck Load Weight/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /10 Miles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /25 Miles/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /50 Miles/i })).toBeInTheDocument();
  });

  it('submits form with valid parameters', () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} isLoading={false} />);

    const submitBtn = screen.getByRole('button', { name: /Evaluate 3 Weather Routes/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    const submittedData = handleSubmit.mock.calls[0][0];
    expect(submittedData.origin).toBe('Chicago, IL');
    expect(submittedData.destination).toBe('New York, NY');
    expect(submittedData.interval_miles).toBe(25);
  });

  it('updates load weight and switches interval', () => {
    const handleSubmit = vi.fn();
    render(<TripForm onSubmit={handleSubmit} isLoading={false} />);

    const interval50Btn = screen.getByText(/50 Miles/i);
    fireEvent.click(interval50Btn);

    const submitBtn = screen.getByRole('button', { name: /Evaluate 3 Weather Routes/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit.mock.calls[0][0].interval_miles).toBe(50);
  });
});
