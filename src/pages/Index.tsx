import { useState, useMemo } from "react";
import { useWeather } from "@/hooks/useWeather";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { LocationSearch } from "@/components/weather/LocationSearch";
import { ApiKeyInput } from "@/components/weather/ApiKeyInput";
import { WeatherLoading } from "@/components/weather/WeatherLoading";
import { WeatherError } from "@/components/weather/WeatherError";
import { WeatherInsights } from "@/components/weather/WeatherInsights";
import { useWeatherProfile } from "@/hooks/useWeatherProfile";
import { adaptDailyToCurrent, adaptHourlyToCurrent } from "@/lib/weatherUtils";
import { Cloud } from "lucide-react";

const Index = () => {
  const {
    currentLocation,
    savedLocations,
    weatherData,
    loading,
    error,
    apiKey,
    saveApiKey,
    searchLocations,
    addLocation,
    removeLocation,
    selectLocation,
    getCurrentPosition,
    refreshWeather,
    lastUpdated,
  } = useWeather();

  const { profile, setProfile } = useWeatherProfile();

  const [selectedHourTs, setSelectedHourTs] = useState<number | null>(null);
  const [selectedDayTs, setSelectedDayTs] = useState<number | null>(null);

  const displayWeather = useMemo(() => {
    if (!weatherData) return null;

    const base = weatherData.current;

    if (selectedHourTs) {
      const hour = weatherData.hourly.find((h) => h.dt === selectedHourTs);
      if (hour) return adaptHourlyToCurrent(hour, base);
    }

    if (selectedDayTs) {
      const day = weatherData.daily.find((d) => d.dt === selectedDayTs);
      if (day) return adaptDailyToCurrent(day, base);
    }

    return base;
  }, [weatherData, selectedHourTs, selectedDayTs]);

  const handleSelectHour = (hour: (typeof weatherData)["hourly"][number]) => {
    setSelectedHourTs(hour.dt);
    setSelectedDayTs(null);
  };

  const handleSelectDay = (day: (typeof weatherData)["daily"][number]) => {
    setSelectedDayTs(day.dt);
    setSelectedHourTs(null);
  };

  // Show API key input if no key is set
  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ApiKeyInput onSave={saveApiKey} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-4 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-3 mb-2 md:mb-4 animate-fade-in">
          <Cloud className="w-9 h-9 md:w-10 md:h-10 text-primary animate-float" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Sunny Skies
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Live, personal weather insights for your day.
            </p>
          </div>
        </header>

        {/* Error State */}
        {error && !loading && (
          <div className="mb-8">
            <WeatherError 
              message={error} 
              onRetry={currentLocation ? () => selectLocation(currentLocation) : undefined} 
            />
          </div>
        )}

        {/* Loading State */}
        {loading && <WeatherLoading />}

        {/* Main Content */}
        {!loading && weatherData && currentLocation && displayWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Current Weather */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              <CurrentWeather
                weather={displayWeather}
                locationName={currentLocation.name}
                country={currentLocation.country}
                lastUpdated={lastUpdated}
                onRefresh={refreshWeather}
                isLoading={loading}
              />
              
              <WeatherInsights
                weatherData={weatherData}
                location={currentLocation}
                profile={profile}
                onProfileChange={setProfile}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <HourlyForecast
                  hourly={weatherData.hourly}
                  selectedTimestamp={selectedHourTs}
                  onSelectHour={handleSelectHour}
                />
                
                <DailyForecast
                  daily={weatherData.daily}
                  selectedTimestamp={selectedDayTs}
                  onSelectDay={handleSelectDay}
                />
              </div>
            </div>

            {/* Right Column - Location Search */}
            <div className="lg:col-span-1">
              <LocationSearch
                currentLocation={currentLocation}
                savedLocations={savedLocations}
                onSearch={searchLocations}
                onSelectLocation={selectLocation}
                onAddLocation={addLocation}
                onRemoveLocation={removeLocation}
                onGetCurrentLocation={getCurrentPosition}
              />
            </div>
          </div>
        )}

        {/* Initial State - No location selected */}
        {!loading && !weatherData && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="glass-strong rounded-3xl p-8 text-center max-w-md">
                <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Select a Location
                </h2>
                <p className="text-muted-foreground">
                  Search for a city or use your current location to see the weather forecast.
                </p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <LocationSearch
                currentLocation={null}
                savedLocations={savedLocations}
                onSearch={searchLocations}
                onSelectLocation={selectLocation}
                onAddLocation={addLocation}
                onRemoveLocation={removeLocation}
                onGetCurrentLocation={getCurrentPosition}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
