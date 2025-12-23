import { Loader2 } from "lucide-react";

export const WeatherLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 glass rounded-full flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black/20 rounded-full blur-lg" />
      </div>
      <p className="mt-6 text-muted-foreground">Fetching weather data...</p>
    </div>
  );
};
