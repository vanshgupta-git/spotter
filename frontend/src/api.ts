import axios from 'axios';
import type { TripPlanResponse, GeocodeResult } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchHealth() {
  const resp = await client.get('/api/health/');
  return resp.data;
}

export async function searchGeocode(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];
  const resp = await client.get<GeocodeResult[]>('/api/geocode/', {
    params: { q: query },
  });
  return resp.data;
}

export interface PlanTripParams {
  origin: string;
  destination: string;
  departure_time: string;
  load_weight: number;
  interval_miles: number;
}

export async function planTrip(params: PlanTripParams): Promise<TripPlanResponse> {
  const resp = await client.post<TripPlanResponse>('/api/route-plan/', params);
  return resp.data;
}
