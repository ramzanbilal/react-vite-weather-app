import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WeatherData, Location, GeocodingResult } from "@/types/weather";

const API_KEY = ""; // Do NOT hard-code a real key here; use the UI/localStorage
const BASE_URL = "https://api.openweathermap.org";

export const useWeather = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [savedLocations, setSavedLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem("weatherLocations");
    return saved ? JSON.parse(saved) : [];
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("openweatherApiKey") || API_KEY;
  });
  const queryClient = useQueryClient();

  const saveApiKey = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("openweatherApiKey", key);
  }, []);

  // Fetch weather using free 2.5 endpoints and adapt into our WeatherData shape
  const fetchWeatherData = useCallback(
    async (lat: number, lon: number): Promise<WeatherData> => {
      if (!apiKey) {
        throw new Error("Please enter your OpenWeatherMap API key");
      }

      const query = `lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

      // Use current weather + 5-day / 3-hour forecast (free plan)
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/data/2.5/weather?${query}`),
        fetch(`${BASE_URL}/data/2.5/forecast?${query}`),
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        if (currentRes.status === 401 || forecastRes.status === 401) {
          throw new Error(
            "Invalid API key or plan. Make sure the free 'Current weather and forecast' API is enabled for your key."
          );
        }
        throw new Error("Failed to fetch weather data");
      }

      const currentJson = await currentRes.json();
      const forecastJson = await forecastRes.json();

      const now = Math.floor(Date.now() / 1000);

      // Current-like structure
      const current = {
        temp: currentJson.main.temp,
        feels_like: currentJson.main.feels_like,
        humidity: currentJson.main.humidity,
        pressure: currentJson.main.pressure,
        wind_speed: currentJson.wind.speed,
        wind_deg: currentJson.wind.deg,
        visibility: currentJson.visibility ?? 10000,
        uvi: 0, // Not available on free 2.5 plan
        clouds: currentJson.clouds?.all ?? 0,
        weather: currentJson.weather,
        dt: currentJson.dt ?? now,
        sunrise: currentJson.sys?.sunrise ?? now,
        sunset: currentJson.sys?.sunset ?? now,
      };

      // Hourly-like (next 24 hours -> 8 x 3h)
      type ForecastListItem = {
        dt: number;
        main: {
          temp: number;
          feels_like: number;
          humidity: number;
        };
        weather: {
          id: number;
          main: string;
          description: string;
          icon: string;
        }[];
        pop?: number;
        wind: {
          speed: number;
        };
      };

      const list = forecastJson.list as ForecastListItem[];

      const hourly = list.slice(0, 8).map((item) => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        weather: item.weather,
        pop: item.pop ?? 0,
        wind_speed: item.wind.speed,
      }));

      // Daily-like: group 3h entries by day, aggregate min/max/pop
      type DailyBucket = {
        dt: number;
        temps: number[];
        weather: {
          id: number;
          main: string;
          description: string;
          icon: string;
        }[];
        humidity: number[];
        wind_speed: number[];
        pop: number[];
      };

      const dailyMap = new Map<string, DailyBucket>();

      list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const key = date.toISOString().slice(0, 10); // YYYY-MM-DD

        if (!dailyMap.has(key)) {
          dailyMap.set(key, {
            dt: item.dt,
            temps: [],
            weather: [],
            humidity: [],
            wind_speed: [],
            pop: [],
          });
        }

        const entry = dailyMap.get(key)!;
        entry.temps.push(item.main.temp);
        entry.weather.push(item.weather[0]);
        entry.humidity.push(item.main.humidity);
        entry.wind_speed.push(item.wind.speed);
        entry.pop.push(item.pop ?? 0);
      });

      const daily = Array.from(dailyMap.values())
        .slice(0, 7)
        .map((entry) => {
          const min = Math.min(...entry.temps);
          const max = Math.max(...entry.temps);
          const day = entry.temps[Math.floor(entry.temps.length / 2)] ?? max;

          return {
            dt: entry.dt,
            temp: {
              min,
              max,
              day,
              night: min,
            },
            weather: [entry.weather[0]],
            humidity:
              entry.humidity.reduce((a, b) => a + b, 0) /
              Math.max(entry.humidity.length, 1),
            wind_speed:
              entry.wind_speed.reduce((a, b) => a + b, 0) /
              Math.max(entry.wind_speed.length, 1),
            pop:
              entry.pop.reduce((a, b) => a + b, 0) /
              Math.max(entry.pop.length, 1),
            uvi: 0, // Not available on free 2.5 plan
            sunrise: current.sunrise,
            sunset: current.sunset,
          };
        });

      const data: WeatherData = {
        lat: currentJson.coord.lat,
        lon: currentJson.coord.lon,
        timezone: forecastJson.city?.timezone?.toString() ?? "UTC",
        current,
        hourly,
        daily,
      };

      return data;
    },
    [apiKey]
  );

  const searchLocations = useCallback(
    async (query: string): Promise<GeocodingResult[]> => {
      if (!apiKey || query.length < 2) return [];

      try {
        const response = await fetch(
          `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(
            query
          )}&limit=5&appid=${apiKey}`
        );

        if (!response.ok) return [];

        return await response.json();
      } catch {
        return [];
      }
    },
    [apiKey]
  );

  const addLocation = useCallback((location: Location) => {
    setSavedLocations((prev) => {
      const exists = prev.some((l) => l.id === location.id);
      if (exists) return prev;
      const updated = [...prev, location];
      localStorage.setItem("weatherLocations", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeLocation = useCallback((locationId: string) => {
    setSavedLocations((prev) => {
      const updated = prev.filter((l) => l.id !== locationId);
      localStorage.setItem("weatherLocations", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const selectLocation = useCallback(
    (location: Location) => {
      setCurrentLocation(location);
      // Prime the query cache and trigger an immediate refetch for the new location
      queryClient.removeQueries({
        queryKey: ["weather", location.lat, location.lon],
      });
    },
    [queryClient]
  );

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Set a basic "Current Location" immediately so weather can start loading
        const fallbackLocation: Location = {
          id: `${latitude}-${longitude}`,
          name: "Current Location",
          country: "",
          lat: latitude,
          lon: longitude,
        };
        setCurrentLocation(fallbackLocation);

        // Try to enhance with reverse geocoding without blocking the initial weather fetch
        try {
          const response = await fetch(
            `${BASE_URL}/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
          );

          if (response.ok) {
            const [data] = await response.json();
            setCurrentLocation((prev) => ({
              id: `${latitude}-${longitude}`,
              name: data?.name || prev?.name || "Current Location",
              country: data?.country || prev?.country || "",
              lat: latitude,
              lon: longitude,
            }));
          }
        } catch {
          // Ignore reverse geocoding errors; we already set a fallback location
        }
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
      }
    );
  }, [apiKey]);

  // Live weather query that automatically refreshes in the background
  const {
    data: liveWeatherData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
    dataUpdatedAt,
  } = useQuery<WeatherData>({
    queryKey: currentLocation
      ? ["weather", currentLocation.lat, currentLocation.lon]
      : ["weather", "idle"],
    queryFn: () =>
      currentLocation
        ? fetchWeatherData(currentLocation.lat, currentLocation.lon)
        : Promise.reject(new Error("No location selected")),
    enabled: !!apiKey && !!currentLocation,
    refetchInterval: 60 * 1000, // 1 minute for near real-time updates
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    // Keep local state in sync with query data for consumers of this hook
    if (liveWeatherData) {
      setWeatherData(liveWeatherData);
    }
  }, [liveWeatherData]);

  useEffect(() => {
    if (queryError instanceof Error) {
      setError(queryError.message);
    }
  }, [queryError]);

  useEffect(() => {
    if (!apiKey || currentLocation) return;

    if (savedLocations.length > 0) {
      selectLocation(savedLocations[0]);
    } else {
      getCurrentPosition();
    }
  }, [
    apiKey,
    currentLocation,
    savedLocations,
    selectLocation,
    getCurrentPosition,
  ]);

  return {
    currentLocation,
    savedLocations,
    weatherData,
    loading: isLoading || isFetching,
    error,
    apiKey,
    saveApiKey,
    searchLocations,
    addLocation,
    removeLocation,
    selectLocation,
    getCurrentPosition,
    fetchWeatherData,
    refreshWeather: () => refetch(),
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
  };
};
