import { Link } from "react-router-dom";
import { Bus, Navigation, Edit2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";
import type { Bus as BusType } from "@/types";

interface BusListItemProps {
  bus: BusType;
  onUpdateLocation?: (busId: string) => void;
  onEdit?: (busId: string) => void;
  onDelete?: (busId: string) => void;
}

const BusListItem = ({ bus, onUpdateLocation, onEdit, onDelete }: BusListItemProps) => {
  return (
    <div className="p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Bus Info */}
        <Link
          to={`/bus/${bus.id}`}
          className="flex items-center gap-4 flex-1 min-w-0 group/info"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md shrink-0 group-hover/info:scale-110 transition-transform">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground group-hover/info:text-primary transition-colors truncate">
              {bus.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {bus.busNumber} • {bus.routeFrom} → {bus.routeTo}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-[10px] flex items-center gap-1 text-muted-foreground uppercase tracking-tight">
                <Navigation className="w-3 h-3 text-accent" />
                Driver: {bus.driverName || 'N/A'}
              </span>
              <span className="text-[10px] flex items-center gap-1 text-muted-foreground uppercase tracking-tight">
                <Users className="w-3 h-3 text-info" />
                Conductor: {bus.conductorName || 'N/A'}
              </span>
            </div>
          </div>
        </Link>

        {/* Status */}
        <div className="flex items-center gap-4">
          <StatusBadge status={bus.status} />
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">ETA: {bus.eta}</p>
            <p className="text-xs text-muted-foreground">{bus.currentLocation}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateLocation?.(bus.id)}
          >
            <Navigation className="w-4 h-4" />
            Update Location
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(bus.id)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete?.(bus.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BusListItem;
