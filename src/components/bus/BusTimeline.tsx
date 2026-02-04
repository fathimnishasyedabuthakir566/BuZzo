import { Calendar, Navigation } from "lucide-react";
import type { BusTiming } from "@/types";

interface BusTimelineProps {
  timings: BusTiming[];
}

const BusTimeline = ({ timings }: BusTimelineProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-accent" />
        Today's Route
      </h2>
      <div className="space-y-4">
        {timings.map((timing, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  timing.status === "departed"
                    ? "bg-success"
                    : timing.status === "current"
                    ? "bg-accent animate-pulse-dot"
                    : "bg-muted-foreground/30"
                }`}
              />
              {index < timings.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    timing.status === "departed" ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <p
                className={`font-medium ${
                  timing.status === "current"
                    ? "text-accent"
                    : timing.status === "departed"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {timing.location}
              </p>
              <p className="text-sm text-muted-foreground">{timing.time}</p>
              {timing.status === "current" && (
                <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-1">
                  <Navigation className="w-3 h-3" />
                  Bus is here
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusTimeline;
