import { MapPin, Navigation, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapPlaceholderProps {
  busLocation?: { lat: number; lng: number; name: string };
  destination?: { lat: number; lng: number; name: string };
  className?: string;
}

const MapPlaceholder = ({ busLocation, destination, className }: MapPlaceholderProps) => {
  return (
    <div className={`relative rounded-xl overflow-hidden bg-secondary ${className}`}>
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Route Line */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-3/4 h-3/4" viewBox="0 0 200 100" fill="none">
          <path
            d="M 20 80 Q 60 20 100 50 T 180 20"
            stroke="hsl(var(--accent))"
            strokeWidth="3"
            strokeDasharray="8 4"
            strokeLinecap="round"
            className="opacity-60"
          />
          {/* Start Point */}
          <circle cx="20" cy="80" r="8" fill="hsl(var(--success))" className="animate-pulse-dot" />
          {/* Bus Location */}
          <circle cx="100" cy="50" r="10" fill="hsl(var(--accent))" />
          <circle cx="100" cy="50" r="6" fill="hsl(var(--card))" />
          {/* End Point */}
          <circle cx="180" cy="20" r="8" fill="hsl(var(--primary))" />
        </svg>
      </div>

      {/* Location Labels */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {busLocation && (
          <div className="glass-card px-3 py-2 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Current Location</p>
                <p className="text-sm font-medium text-foreground">{busLocation.name}</p>
              </div>
            </div>
          </div>
        )}
        {destination && (
          <div className="glass-card px-3 py-2 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{destination.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button variant="glass" size="icon" className="w-10 h-10">
          <Locate className="w-4 h-4" />
        </Button>
      </div>

      {/* Connect Map CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px]">
        <div className="text-center glass-card p-6 rounded-xl max-w-xs">
          <MapPin className="w-12 h-12 text-accent mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Live Map Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Real-time bus tracking on an interactive map will be available once connected to the backend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
