import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Wind,
  Cloudy,
} from "lucide-react";
import type {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
} from "@/types/weather";

export const getWeatherIcon = (iconCode: string) => {
  const code = iconCode.slice(0, 2);
  
  switch (code) {
    case "01": return Sun;
    case "02": return Cloud;
    case "03": return Cloudy;
    case "04": return Cloudy;
    case "09": return CloudDrizzle;
    case "10": return CloudRain;
    case "11": return CloudLightning;
    case "13": return CloudSnow;
    case "50": return CloudFog;
    default: return Cloud;
  }
};

export const getWeatherBackground = (iconCode: string): string => {
  const code = iconCode.slice(0, 2);
  const isDay = iconCode.endsWith("d");
  
  if (code === "01") {
    return isDay 
      ? "from-sky-400 via-blue-500 to-indigo-600"
      : "from-indigo-900 via-purple-900 to-slate-900";
  }
  
  if (["02", "03", "04"].includes(code)) {
    return isDay
      ? "from-slate-400 via-slate-500 to-slate-600"
      : "from-slate-700 via-slate-800 to-slate-900";
  }
  
  if (["09", "10"].includes(code)) {
    return "from-slate-600 via-slate-700 to-slate-800";
  }
  
  if (code === "11") {
    return "from-slate-800 via-purple-900 to-slate-900";
  }
  
  if (code === "13") {
    return "from-slate-200 via-blue-200 to-slate-300";
  }
  
  return "from-slate-500 via-slate-600 to-slate-700";
};

export const formatTemperature = (temp: number): string => {
  return `${Math.round(temp)}°`;
};

export const formatTime = (timestamp: number, timezone: string = "UTC"): string => {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDay = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }
  
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getWindDirection = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const getUVIndexLevel = (uvi: number): { label: string; color: string } => {
  if (uvi <= 2) return { label: "Low", color: "text-green-400" };
  if (uvi <= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (uvi <= 7) return { label: "High", color: "text-orange-400" };
  if (uvi <= 10) return { label: "Very High", color: "text-red-400" };
  return { label: "Extreme", color: "text-purple-400" };
};

/**
 * Build a CurrentWeather-like snapshot from an hourly entry,
 * filling gaps from the current conditions so the UI can reuse
 * the same component for different time slices.
 */
export const adaptHourlyToCurrent = (
  hour: HourlyWeather,
  base: CurrentWeather
): CurrentWeather => ({
  temp: hour.temp,
  feels_like: hour.feels_like,
  humidity: hour.humidity,
  pressure: base.pressure,
  wind_speed: hour.wind_speed,
  wind_deg: base.wind_deg,
  visibility: base.visibility,
  uvi: base.uvi,
  clouds: base.clouds,
  weather: hour.weather,
  dt: hour.dt,
  sunrise: base.sunrise,
  sunset: base.sunset,
});

/**
 * Build a CurrentWeather-like snapshot from a daily entry.
 */
export const adaptDailyToCurrent = (
  day: DailyWeather,
  base: CurrentWeather
): CurrentWeather => ({
  temp: day.temp.day,
  feels_like: day.temp.day,
  humidity: day.humidity,
  pressure: base.pressure,
  wind_speed: day.wind_speed,
  wind_deg: base.wind_deg,
  visibility: base.visibility,
  uvi: day.uvi,
  clouds: base.clouds,
  weather: day.weather,
  dt: day.dt,
  sunrise: day.sunrise,
  sunset: day.sunset,
});
