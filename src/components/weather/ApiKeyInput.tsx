import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, ExternalLink } from "lucide-react";

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  currentKey?: string;
}

export const ApiKeyInput = ({ onSave, currentKey }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState(currentKey || "");
  const [saved, setSaved] = useState(!!currentKey);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setSaved(true);
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-8 max-w-md mx-auto animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center">
          <Key className="w-8 h-8 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-center text-foreground mb-2">
        OpenWeatherMap API Key
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        To use this weather app, you need a free API key from OpenWeatherMap.
      </p>

      <div className="space-y-4">
        <Input
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setSaved(false);
          }}
          className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl"
        />

        <Button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          disabled={!apiKey.trim() || saved}
        >
          {saved ? "Saved!" : "Save API Key"}
        </Button>

        <a
          href="https://openweathermap.org/api"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-primary hover:underline text-sm"
        >
          Get a free API key
          <ExternalLink className="w-4 h-4" />
        </a>

        <p className="text-xs text-center text-muted-foreground">
          Note: You need a "One Call API 3.0" subscription (free tier available).
        </p>
      </div>
    </div>
  );
};
