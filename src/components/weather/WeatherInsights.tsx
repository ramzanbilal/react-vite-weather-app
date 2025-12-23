import { WeatherData, Location, WeatherProfile } from "@/types/weather";
import { cn } from "@/lib/utils";
import { buildInsightSections } from "@/lib/weatherInsights";
import {
  Lightbulb,
  Umbrella,
  SunMedium,
  Wind,
  AlertTriangle,
  Shirt,
  Bus,
  HeartPulse,
} from "lucide-react";

interface WeatherInsightsProps {
  weatherData: WeatherData;
  location: Location;
  profile: WeatherProfile;
  onProfileChange: (profile: WeatherProfile) => void;
}

export const WeatherInsights = ({
  weatherData,
  location,
  profile,
  onProfileChange,
}: WeatherInsightsProps) => {
  const sections = buildInsightSections(weatherData, profile);

  const handleSensitivityChange = (type: "heat" | "cold", value: "low" | "medium" | "high") => {
    onProfileChange({
      ...profile,
      ...(type === "heat"
        ? { heatSensitivity: value }
        : { coldSensitivity: value }),
    });
  };

  return (
    <div
      className={cn(
        "glass rounded-3xl p-6 mt-2 animate-slide-up",
        "border border-white/15 bg-gradient-to-br from-black/20 via-black/10 to-primary/10"
      )}
      style={{ animationDelay: "0.25s" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-400/20 flex items-center justify-center border border-amber-300/40">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Smart suggestions for {location.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Decision-focused tips about what to wear, how to travel, and when to go outside.
            </p>
          </div>
        </div>

        {/* Quick sensitivity controls */}
        <div className="flex flex-col gap-1 text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Comfort profile
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleSensitivityChange("heat", "low")}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] border",
                profile.heatSensitivity === "low"
                  ? "bg-primary/20 border-primary/40 text-primary-foreground"
                  : "border-white/10 text-muted-foreground hover:bg-white/5"
              )}
            >
              Heat tolerant
            </button>
            <button
              type="button"
              onClick={() => handleSensitivityChange("cold", "high")}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] border",
                profile.coldSensitivity === "high"
                  ? "bg-primary/20 border-primary/40 text-primary-foreground"
                  : "border-white/10 text-muted-foreground hover:bg-white/5"
              )}
            >
              Feels cold easily
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-muted-foreground mb-4">{sections.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Activities */}
        <InsightCard
          title="Activities & timing"
          icon={<SunMedium className="w-4 h-4 text-primary" />}
          items={sections.activities}
        />

        {/* Clothing */}
        <InsightCard
          title="What to wear"
          icon={<Shirt className="w-4 h-4 text-primary" />}
          items={sections.clothing}
        />

        {/* Commute */}
        <InsightCard
          title="Commute & travel"
          icon={<Bus className="w-4 h-4 text-primary" />}
          items={sections.commute}
          fallback="No major commute impacts expected based on your usual hours."
        />

        {/* Alerts & health */}
        <InsightCard
          title="Alerts & wellbeing"
          icon={<HeartPulse className="w-4 h-4 text-primary" />}
          items={[...sections.alerts, ...sections.health]}
        />
      </div>
    </div>
  );
};

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  items: { title: string; body: string }[];
  fallback?: string;
}

const InsightCard = ({ title, icon, items, fallback }: InsightCardProps) => (
  <div className="glass rounded-2xl p-4 space-y-2">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <p className="text-xs font-semibold text-foreground">{title}</p>
    </div>

    {items.length === 0 && fallback ? (
      <p className="text-xs text-muted-foreground">{fallback}</p>
    ) : (
      <ul className="space-y-2">
        {items.map((insight, index) => (
          <li key={index}>
            <p className="text-xs font-medium text-foreground">{insight.title}</p>
            <p className="text-xs text-muted-foreground">{insight.body}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
);

