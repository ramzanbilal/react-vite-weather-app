import { cn } from "@/lib/utils";
import {
  getWeatherIcon,
  formatTemperature,
  formatTime,
  getWindDirection,
  getUVIndexLevel,
} from "@/lib/weatherUtils";
import { CurrentWeather as CurrentWeatherType } from "@/types/weather";
import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, Wifi, RefreshCw } from "lucide-react";

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  locationName: string;
  country: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CurrentWeather = ({
  weather,
  locationName,
  country,
  lastUpdated,
  onRefresh,
  isLoading,
}: CurrentWeatherProps) => {
  const WeatherIcon = getWeatherIcon(weather.weather[0].icon);
  const uvIndex = getUVIndexLevel(weather.uvi);

  return (
    <div className="glass-strong rounded-3xl p-5 md:p-8 animate-fade-in relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

      {/* Header: Location & Live status */}
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground text-glow">
            {locationName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">{country}</p>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-3">
          <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
            </span>
            <span className="text-xs font-medium text-emerald-200 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Live
            </span>
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border border-white/15 bg-black/30 text-foreground hover:bg-white/10 transition-colors",
                isLoading && "opacity-60 cursor-wait"
              )}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn(
                  "w-3 h-3",
                  isLoading && "animate-spin text-primary"
                )}
              />
              {isLoading ? "Refreshing..." : "Refresh now"}
            </button>
          )}

          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground text-right">
              Updated{" "}
              {lastUpdated.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Main Temperature Display */}
      <div className="relative flex flex-col items-center mb-6 md:mb-8">
        <div className="relative">
          <WeatherIcon 
            className={cn(
              "w-28 h-28 md:w-32 md:h-32 text-accent animate-float drop-shadow-lg",
              weather.weather[0].icon.startsWith("01") && "text-weather-sunny"
            )} 
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/20 rounded-full blur-lg" />
        </div>
        
        <div className="text-6xl md:text-8xl font-light text-foreground tracking-tighter mt-4">
          {formatTemperature(weather.temp)}
        </div>
        
        <p className="text-lg md:text-xl capitalize text-muted-foreground mt-2 text-center px-4 md:px-0">
          {weather.weather[0].description}
        </p>
        
        <p className="text-muted-foreground mt-1">
          Feels like {formatTemperature(weather.feels_like)}
        </p>
      </div>

      {/* Weather Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WeatherStat 
          icon={<Droplets className="w-5 h-5 text-primary" />}
          label="Humidity"
          value={`${weather.humidity}%`}
        />
        <WeatherStat 
          icon={<Wind className="w-5 h-5 text-primary" />}
          label="Wind"
          value={`${Math.round(weather.wind_speed)} km/h ${getWindDirection(weather.wind_deg)}`}
        />
        <WeatherStat 
          icon={<Eye className="w-5 h-5 text-primary" />}
          label="Visibility"
          value={`${(weather.visibility / 1000).toFixed(1)} km`}
        />
        <WeatherStat 
          icon={<Gauge className="w-5 h-5 text-primary" />}
          label="Pressure"
          value={`${weather.pressure} hPa`}
        />
      </div>

      {/* Sunrise/Sunset */}
      <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Sunrise className="w-5 h-5 text-weather-sunny" />
          <span className="text-muted-foreground">
            {formatTime(weather.sunrise)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="w-5 h-5 text-orange-400" />
          <span className="text-muted-foreground">
            {formatTime(weather.sunset)}
          </span>
        </div>
      </div>

      {/* UV Index */}
      <div className="text-center mt-4">
        <span className="text-muted-foreground">UV Index: </span>
        <span className={cn("font-medium", uvIndex.color)}>
          {Math.round(weather.uvi)} ({uvIndex.label})
        </span>
      </div>
    </div>
  );
};

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const WeatherStat = ({ icon, label, value }: WeatherStatProps) => (
  <div className="glass rounded-2xl p-4 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);
