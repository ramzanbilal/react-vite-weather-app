import type { WeatherData, WeatherProfile } from "@/types/weather";

export type Insight = {
  title: string;
  body: string;
};

export interface InsightSections {
  activities: Insight[];
  clothing: Insight[];
  commute: Insight[];
  alerts: Insight[];
  health: Insight[];
  summary: string;
}

const feelsHot = (temp: number, profile: WeatherProfile) => {
  const adjustment =
    profile.heatSensitivity === "high" ? -3 : profile.heatSensitivity === "low" ? 3 : 0;
  return temp + adjustment >= profile.heatAlertThreshold;
};

const feelsCold = (temp: number, profile: WeatherProfile) => {
  const adjustment =
    profile.coldSensitivity === "high" ? 3 : profile.coldSensitivity === "low" ? -3 : 0;
  return temp - adjustment <= profile.coldAlertThreshold;
};

export const buildInsightSections = (
  weather: WeatherData,
  profile: WeatherProfile
): InsightSections => {
  const { current, hourly, daily } = weather;
  const today = daily[0];

  const nowTemp = current.temp;
  const nowHumidity = current.humidity;
  const nowWindKmh = Math.round(current.wind_speed * 3.6);

  // Determine a “preferred” hour for activities based on profile
  const targetHour =
    profile.preferredActivityTime === "morning"
      ? 8
      : profile.preferredActivityTime === "afternoon"
      ? 15
      : 19;

  const bestActivityHour = hourly.reduce((best, h) => {
    const diff =
      Math.abs(new Date(h.dt * 1000).getHours() - targetHour) +
      (h.pop ?? 0) * 5 +
      (h.humidity > 80 ? 1 : 0);
    const bestDiff =
      Math.abs(new Date(best.dt * 1000).getHours() - targetHour) +
      (best.pop ?? 0) * 5 +
      (best.humidity > 80 ? 1 : 0);
    return diff < bestDiff ? h : best;
  }, hourly[0]);

  const activities: Insight[] = [];
  const clothing: Insight[] = [];
  const commute: Insight[] = [];
  const alerts: Insight[] = [];
  const health: Insight[] = [];

  // Activity-based recommendations
  const rainSoon =
    today.pop > 0.5 || hourly.slice(0, 6).some((h) => (h.pop ?? 0) > 0.5);

  if (!rainSoon && !feelsHot(nowTemp, profile) && !feelsCold(nowTemp, profile)) {
    activities.push({
      title: "Outdoor friendly right now",
      body:
        "Conditions are comfortable for a walk, light run, or outdoor coffee. No strong weather risks at the moment.",
    });
  } else if (rainSoon) {
    activities.push({
      title: "Plan around upcoming rain",
      body:
        "Rain is likely in the next few hours. If you’re planning a walk or run, aim to go earlier or carry waterproof gear.",
    });
  }

  activities.push({
    title: "Best time to be outside today",
    body: `Around ${new Date(
      bestActivityHour.dt * 1000
    ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} looks like the best balance of temperature and rain chance for outdoor plans.`,
  });

  // Clothing suggestions
  if (feelsHot(nowTemp, profile)) {
    clothing.push({
      title: "Dress for heat",
      body:
        "Light, breathable fabrics and sunscreen are recommended. Avoid dark, heavy layers and stay hydrated if you’re outside for long.",
    });
  } else if (feelsCold(nowTemp, profile)) {
    clothing.push({
      title: "Dress for cold",
      body:
        "Layered clothing, a warm outer layer, and something to cover your hands and ears will keep you comfortable.",
    });
  } else {
    clothing.push({
      title: "Balanced outfit",
      body:
        "A light jacket or hoodie should be enough. You can add or remove layers as the temperature shifts through the day.",
    });
  }

  if (nowWindKmh >= profile.windAlertThreshold) {
    clothing.push({
      title: "Wind-aware outfit",
      body:
        "It’s quite windy — a windproof jacket and secure headwear are a good idea, especially on open streets or bridges.",
    });
  }

  // Commute impact
  const commuteHours = hourly.filter((h) => {
    const hour = new Date(h.dt * 1000).getHours();
    return hour >= profile.commuteStartHour && hour <= profile.commuteEndHour;
  });

  const worstCommuteHour = commuteHours.length
    ? commuteHours.reduce((worst, h) =>
        (h.pop ?? 0) > (worst.pop ?? 0) ? h : worst
      )
    : null;

  if (worstCommuteHour && (worstCommuteHour.pop ?? 0) > 0.3) {
    commute.push({
      title: "Commute rain risk",
      body:
        "There’s a decent chance of rain during your usual commute window. Consider leaving a bit early and keeping an umbrella handy.",
    });
  }

  if (nowWindKmh >= profile.windAlertThreshold) {
    commute.push({
      title: "Wind and travel",
      body:
        "Strong winds may affect cycling or driving on open routes. Hold the wheel firmly and be cautious when passing large vehicles.",
    });
  }

  // Alerts / thresholds
  if (feelsHot(nowTemp, profile)) {
    alerts.push({
      title: "Heat alert",
      body:
        "Current conditions cross your heat comfort threshold. Take breaks in the shade and drink water regularly.",
    });
  }

  if (feelsCold(nowTemp, profile)) {
    alerts.push({
      title: "Cold alert",
      body:
        "Current conditions are below your cold comfort threshold. Limit long exposures without proper clothing.",
    });
  }

  // Health & environment (approximate, based on humidity and heat)
  if (nowHumidity >= 80 && nowTemp >= 25) {
    health.push({
      title: "Humidity and comfort",
      body:
        "High humidity makes it feel hotter than the temperature suggests. You may feel sticky or tired more quickly outdoors.",
    });
  }

  if (nowTemp >= 30) {
    health.push({
      title: "Hydration reminder",
      body:
        "Heat can increase the risk of dehydration. Carry water if you’re out for more than 20–30 minutes.",
    });
  }

  if (health.length === 0) {
    health.push({
      title: "Weather & wellbeing",
      body:
        "No strong weather-related health concerns from heat, cold, or humidity at the moment.",
    });
  }

  // Plain-language daily summary
  const maxToday = today.temp.max;
  const minToday = today.temp.min;
  const warmerThanNow = maxToday > nowTemp + 2;
  const coolerThanNow = maxToday < nowTemp - 2;

  let summary = "Today’s weather is fairly stable compared to the current conditions.";
  if (warmerThanNow) {
    summary = "Expect the day to warm up compared to now, especially in the afternoon.";
  } else if (coolerThanNow) {
    summary = "Temperatures will ease off later, making it feel cooler than it does now.";
  }

  if (today.pop > 0.4) {
    summary += " There is a noticeable chance of rain at some point, so flexible plans work best.";
  }

  return {
    activities,
    clothing,
    commute,
    alerts,
    health,
    summary,
  };
};


