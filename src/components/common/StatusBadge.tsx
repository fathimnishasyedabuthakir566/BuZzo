import { cn } from "@/lib/utils";

type StatusType =
  | "on-time" | "delayed" | "arriving" | "departed" | "unavailable" | "completed" | "not-started"
  | "active" | "inactive" | "on-route" | "arrived" | "upcoming" | "not running" | "arriving soon";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  "on-time": {
    label: "On Time",
    className: "status-badge-success",
    dot: "bg-success",
  },
  "active": {
    label: "Active",
    className: "status-badge-success",
    dot: "bg-success",
  },
  "delayed": {
    label: "Delayed",
    className: "status-badge-warning",
    dot: "bg-warning",
  },
  "arriving": {
    label: "Arriving Soon",
    className: "status-badge-info",
    dot: "bg-info animate-pulse-dot",
  },
  "arriving soon": {
    label: "Arriving Soon",
    className: "status-badge-info",
    dot: "bg-info animate-pulse-dot",
  },
  "on-route": {
    label: "On Route",
    className: "status-badge-info",
    dot: "bg-info animate-pulse-dot",
  },
  "departed": {
    label: "Departed",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "arrived": {
    label: "Arrived",
    className: "bg-success/20 text-success",
    dot: "bg-success",
  },
  "unavailable": {
    label: "Not Available",
    className: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
  },
  "inactive": {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "completed": {
    label: "Completed",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "not-started": {
    label: "Upcoming",
    className: "bg-amber-500/15 text-amber-500",
    dot: "bg-amber-500",
  },
  "upcoming": {
    label: "Upcoming",
    className: "bg-amber-500/15 text-amber-500",
    dot: "bg-amber-500",
  },
  "not running": {
    label: "Not Running",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  // Use lowercase for lookup and provide a default fallback
  const statusKey = (status || "").toLowerCase();
  const config = statusConfig[statusKey] || {
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
      config.className,
      className
    )}>
      <span className={cn("w-2 h-2 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
