import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Location, GeocodingResult } from "@/types/weather";
import { Search, MapPin, Plus, X, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  currentLocation: Location | null;
  savedLocations: Location[];
  onSearch: (query: string) => Promise<GeocodingResult[]>;
  onSelectLocation: (location: Location) => void;
  onAddLocation: (location: Location) => void;
  onRemoveLocation: (locationId: string) => void;
  onGetCurrentLocation: () => void;
}

export const LocationSearch = ({
  currentLocation,
  savedLocations,
  onSearch,
  onSelectLocation,
  onAddLocation,
  onRemoveLocation,
  onGetCurrentLocation,
}: LocationSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const searchResults = await onSearch(query);
        setResults(searchResults);
        setShowResults(true);
        setIsSearching(false);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, onSearch]);

  const handleSelectResult = (result: GeocodingResult) => {
    const location: Location = {
      id: `${result.lat}-${result.lon}`,
      name: result.name,
      country: result.country,
      lat: result.lat,
      lon: result.lon,
    };
    
    onAddLocation(location);
    onSelectLocation(location);
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="glass rounded-3xl p-4 md:p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">
        Locations
      </h2>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground rounded-xl"
        />
        
        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50">
            {results.map((result, index) => (
              <button
                key={`${result.lat}-${result.lon}-${index}`}
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-foreground">{result.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.state ? `${result.state}, ` : ""}{result.country}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <Button
        onClick={onGetCurrentLocation}
        variant="outline"
        className="w-full mb-4 bg-white/5 border-white/10 text-foreground hover:bg-white/10 rounded-xl"
      >
        <Navigation className="w-4 h-4 mr-2" />
        Use Current Location
      </Button>

      {/* Saved Locations */}
      {savedLocations.length > 0 && (
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {savedLocations.map((location) => (
              <div
                key={location.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer",
                  currentLocation?.id === location.id
                    ? "glass-strong border-primary/30"
                    : "hover:glass-subtle"
                )}
                onClick={() => onSelectLocation(location)}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={cn(
                    "w-4 h-4",
                    currentLocation?.id === location.id 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )} />
                  <div>
                    <p className={cn(
                      "font-medium",
                      currentLocation?.id === location.id 
                        ? "text-primary" 
                        : "text-foreground"
                    )}>
                      {location.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{location.country}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveLocation(location.id);
                  }}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
