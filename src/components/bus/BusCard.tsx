import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, ArrowRight, Navigation } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";
import type { BusStatus } from "@/types";

interface BusCardProps {
  id: string;
  name: string;
  routeFrom: string;
  routeTo: string;
  status: BusStatus;
  eta?: string;
  lastUpdate?: string;
  currentLocation?: string;
  scheduledTime: string;
  platformNumber?: number;
  className?: string;
}

const BusCard = ({
  id,
  name,
  routeFrom,
  routeTo,
  status,
  eta,
  lastUpdate,
  currentLocation,
  scheduledTime,
  platformNumber,
  className,
}: BusCardProps) => {
  return (
    <Link to={`/bus/${id}`} className={cn("block", className)}>
      <div className="bus-card group relative overflow-hidden">
        {platformNumber && (
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl font-black text-sm shadow-sm z-10">
            PLATFORM {platformNumber}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Bus className="w-6 h-6 text-primary-foreground animate-bus-move" />
            </div>
            <div className="min-w-0">
              <h3 className="card-title group-hover:text-accent transition-colors truncate pr-20">
                {name}
              </h3>
              <p className="card-description flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-accent" />
                <span className="truncate">{routeFrom}</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
                <span className="truncate text-primary font-medium">{routeTo}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={status} />
          {eta && (
            <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
              ETA: {eta}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-sm font-semibold text-foreground">{scheduledTime}</p>
            </div>
          </div>
          {eta && (
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">ETA</p>
                <p className="text-sm font-semibold text-foreground">{eta}</p>
              </div>
            </div>
          )}
          {currentLocation && (
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-info" />
              <div>
                <p className="text-xs text-muted-foreground">Current Location</p>
                <p className="text-sm font-medium text-foreground truncate">{currentLocation}</p>
              </div>
            </div>
          )}
        </div>

        {lastUpdate && (
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {lastUpdate}
          </p>
        )}
      </div>
    </Link>
  );
};

export default BusCard;
