import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherErrorProps {
  message: string;
  onRetry?: () => void;
}

export const WeatherError = ({ message, onRetry }: WeatherErrorProps) => {
  return (
    <div className="glass-strong rounded-3xl p-8 max-w-md mx-auto text-center animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-foreground mb-2">
        Oops! Something went wrong
      </h2>
      
      <p className="text-muted-foreground mb-6">{message}</p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="bg-white/5 border-white/10 text-foreground hover:bg-white/10 rounded-xl"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};
