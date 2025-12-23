import { DailyWeather as DailyWeatherType } from "@/types/weather";
import { getWeatherIcon, formatTemperature, formatDay, formatDate } from "@/lib/weatherUtils";
import { cn } from "@/lib/utils";
import { Droplets } from "lucide-react";

interface DailyForecastProps {
  daily: DailyWeatherType[];
  selectedTimestamp?: number | null;
  onSelectDay?: (day: DailyWeatherType) => void;
}

export const DailyForecast = ({
  daily,
  selectedTimestamp,
  onSelectDay,
}: DailyForecastProps) => {
  // Show 7 days
  const week = daily.slice(0, 7);

  return (
    <div className="glass rounded-3xl p-4 md:p-6 animate-slide-up h-full" style={{ animationDelay: "0.2s" }}>
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
        7-day outlook
      </h2>
      
      <div className="space-y-3">
        {week.map((day, index) => {
          const WeatherIcon = getWeatherIcon(day.weather[0].icon);
          const isToday = index === 0;
          const isSelected = selectedTimestamp === day.dt;

          return (
            <div
              key={day.dt}
              className={cn(
                "flex items-center justify-between py-3 px-4 rounded-2xl transition-all cursor-pointer",
                (isToday && !selectedTimestamp) || isSelected
                  ? "glass-strong border-primary/40 ring-1 ring-primary/40"
                  : "hover:glass-subtle"
              )}
              onClick={() => onSelectDay?.(day)}
            >
              {/* Day */}
              <div className="w-24">
                <p className={cn(
                  "font-medium",
                  (isToday && !selectedTimestamp) || isSelected
                    ? "text-primary"
                    : "text-foreground"
                )}>
                  {formatDay(day.dt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(day.dt)}
                </p>
              </div>

              {/* Weather Icon & Description */}
              <div className="flex items-center gap-3 flex-1 justify-center">
                <WeatherIcon className={cn(
                  "w-8 h-8",
                  day.weather[0].icon.startsWith("01") 
                    ? "text-weather-sunny" 
                    : "text-muted-foreground"
                )} />
                
                {day.pop > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <Droplets className="w-4 h-4" />
                    <span className="text-sm">{Math.round(day.pop * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Temperature Range */}
              <div className="flex items-center gap-4 w-32 justify-end">
                <span className="text-lg font-medium text-foreground">
                  {formatTemperature(day.temp.max)}
                </span>
                <span className="text-lg text-muted-foreground">
                  {formatTemperature(day.temp.min)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
