import { useEffect, useState } from "react";
import type { WeatherProfile, SensitivityLevel } from "@/types/weather";

const STORAGE_KEY = "weatherProfile";

const defaultProfile: WeatherProfile = {
  heatSensitivity: "medium",
  coldSensitivity: "medium",
  commuteStartHour: 8,
  commuteEndHour: 10,
  preferredActivityTime: "evening",
  heatAlertThreshold: 30,
  coldAlertThreshold: 5,
  windAlertThreshold: 40,
};

export const useWeatherProfile = () => {
  const [profile, setProfile] = useState<WeatherProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultProfile;
      return { ...defaultProfile, ...JSON.parse(stored) } as WeatherProfile;
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = <K extends keyof WeatherProfile>(
    key: K,
    value: WeatherProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const setSensitivity = (type: "heat" | "cold", level: SensitivityLevel) => {
    updateProfile(type === "heat" ? "heatSensitivity" : "coldSensitivity", level);
  };

  return {
    profile,
    setProfile,
    updateProfile,
    setSensitivity,
  };
};


