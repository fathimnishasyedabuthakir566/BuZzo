import { cn } from "@/lib/utils";

type StatusType = "on-time" | "delayed" | "arriving" | "departed" | "unavailable" | "completed" | "not-started";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dot: string }> = {
  "on-time": {
    label: "On Time",
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
  "departed": {
    label: "Departed",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "unavailable": {
    label: "Not Available",
    className: "bg-destructive/15 text-destructive",
    dot: "bg-destructive",
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
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span className={cn(config.className, className)}>
      <span className={cn("w-2 h-2 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
