export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  uvi: number;
  clouds: number;
  weather: WeatherCondition[];
  dt: number;
  sunrise: number;
  sunset: number;
}

export interface HourlyWeather {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  weather: WeatherCondition[];
  pop: number;
  wind_speed: number;
}

export interface DailyWeather {
  dt: number;
  temp: {
    min: number;
    max: number;
    day: number;
    night: number;
  };
  weather: WeatherCondition[];
  humidity: number;
  wind_speed: number;
  pop: number;
  uvi: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherData {
  lat: number;
  lon: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export type SensitivityLevel = "low" | "medium" | "high";

export interface WeatherProfile {
  /** How quickly the user feels too hot */
  heatSensitivity: SensitivityLevel;
  /** How quickly the user feels too cold */
  coldSensitivity: SensitivityLevel;
  /** Commute window start hour (0-23) */
  commuteStartHour: number;
  /** Commute window end hour (0-23) */
  commuteEndHour: number;
  /** Preferred outdoor activity time */
  preferredActivityTime: "morning" | "afternoon" | "evening";
  /** Thresholds for alerts (in °C and km/h) */
  heatAlertThreshold: number;
  coldAlertThreshold: number;
  windAlertThreshold: number; // km/h
}

export interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
