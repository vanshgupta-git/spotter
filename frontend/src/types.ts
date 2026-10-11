export type RiskLevelType = "Low" | "Moderate" | "High" | "Severe" | "No Travel" | "Unknown";

export interface WeatherCondition {
  wind_mph: number | null;
  rain_in_hr: number | null;
  snow_in_hr: number | null;
  temperature_f?: number | null;
  matched_time?: string | null;
  is_available: boolean;
}

export interface RiskData {
  overall_risk: RiskLevelType;
  overall_score: number;
  primary_hazard: string;
  summary: string;
  is_no_travel: boolean;
  is_incomplete: boolean;
  color: string;
  wind: {
    value_mph: number | null;
    risk: string;
    explanation: string;
  };
  rain: {
    value_in_hr: number | null;
    risk: string;
    explanation: string;
  };
  snow: {
    value_in_hr: number | null;
    risk: string;
    explanation: string;
  };
}

export interface HourlyRiskPoint {
  hour_offset: number;
  time: string;
  wind_mph: number | null;
  rain_in_hr: number | null;
  snow_in_hr: number | null;
  risk_level: RiskLevelType;
  risk_score: number;
  color: string;
  summary?: string;
}

export interface Checkpoint {
  index: number;
  name: string;
  is_origin: boolean;
  is_destination: boolean;
  distance_miles: number;
  latitude: number;
  longitude: number;
  elapsed_seconds: number;
  elapsed_hours: number;
  eta_iso: string;
  eta_display: string;
  segment_miles?: number;
  weather: WeatherCondition;
  risk_data: RiskData;
  hourly_risks?: HourlyRiskPoint[];
}

export interface RiskSummary {
  severe_miles: number;
  high_miles: number;
  moderate_miles: number;
  low_miles: number;
  no_travel_miles: number;
  average_risk: number;
  has_no_travel: boolean;
  has_incomplete_weather: boolean;
  total_distance_miles: number;
}

export interface RouteOption {
  id: string;
  name: string;
  summary: string;
  distance_meters: number;
  distance_miles: number;
  duration_seconds: number;
  duration_hours: number;
  coordinates: [number, number][]; // [lon, lat]
  checkpoints: Checkpoint[];
  risk_summary: RiskSummary;
  rank: number;
  is_recommended: boolean;
  recommendation_badge: string;
  recommendation_explanation: string;
}

export interface CorridorPoint {
  latitude: number;
  longitude: number;
  hourly: HourlyRiskPoint[];
}

export interface TripPlanResponse {
  status: string;
  trip_input: {
    origin: { name: string; latitude: number; longitude: number };
    destination: { name: string; latitude: number; longitude: number };
    departure_time: string;
    load_weight_lbs: number;
    interval_miles: number;
  };
  recommendation: {
    status: string;
    overall_advice: string;
    recommended_route_id: string | null;
  };
  routes: RouteOption[];
  corridor_heatmap: CorridorPoint[];
}

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
  display_name: string;
}
