import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HourlyWeather as HourlyWeatherType } from "@/types/weather";
import { getWeatherIcon, formatTemperature, formatTime } from "@/lib/weatherUtils";
import { cn } from "@/lib/utils";
import { Droplets } from "lucide-react";

interface HourlyForecastProps {
  hourly: HourlyWeatherType[];
  selectedTimestamp?: number | null;
  onSelectHour?: (hour: HourlyWeatherType) => void;
}

export const HourlyForecast = ({
  hourly,
  selectedTimestamp,
  onSelectHour,
}: HourlyForecastProps) => {
  // Show next 24 hours
  const next24Hours = hourly.slice(0, 24);

  return (
    <div className="glass rounded-3xl p-4 md:p-6 animate-slide-up h-full" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
        Hourly forecast
      </h2>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {next24Hours.map((hour, index) => {
            const WeatherIcon = getWeatherIcon(hour.weather[0].icon);
            const isNow = index === 0;
            const isSelected = selectedTimestamp === hour.dt;

            return (
              <div
                key={hour.dt}
                className={cn(
                  "flex flex-col items-center gap-2 min-w-[64px] py-3 md:py-4 px-3 rounded-2xl transition-all cursor-pointer",
                  (isNow && !selectedTimestamp) || isSelected
                    ? "glass-strong border-primary/40 ring-1 ring-primary/40"
                    : "hover:glass-subtle"
                )}
                onClick={() => onSelectHour?.(hour)}
              >
                <span className={cn(
                  "text-sm",
                  (isNow && !selectedTimestamp) || isSelected
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}>
                  {isNow && !selectedTimestamp ? "Now" : formatTime(hour.dt)}
                </span>
                
                <WeatherIcon className={cn(
                  "w-8 h-8",
                  hour.weather[0].icon.startsWith("01") 
                    ? "text-weather-sunny" 
                    : "text-muted-foreground"
                )} />
                
                <span className="text-lg font-medium text-foreground">
                  {formatTemperature(hour.temp)}
                </span>

                {hour.pop > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <Droplets className="w-3 h-3" />
                    <span className="text-xs">{Math.round(hour.pop * 100)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-50" />
      </ScrollArea>
    </div>
  );
};
