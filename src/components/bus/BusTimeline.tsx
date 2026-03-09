import { Calendar, Navigation, MapPin } from "lucide-react";
import type { BusTiming } from "@/types";

interface BusTimelineProps {
  timings: BusTiming[];
  nearestStopName?: string;
}

const BusTimeline = ({ timings, nearestStopName }: BusTimelineProps) => {
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-accent" />
        Today's Route
      </h2>
      <div className="space-y-4">
        {(Array.isArray(timings) ? timings : []).map((timing, index) => {
          const isNearest = nearestStopName === timing.location;
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full ${timing.status === "departed"
                    ? "bg-success"
                    : timing.status === "current"
                      ? "bg-accent animate-pulse-dot"
                      : isNearest
                        ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                        : "bg-muted-foreground/30"
                    }`}
                />
                {index < timings.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${timing.status === "departed" ? "bg-success" : "bg-border"
                      }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-medium ${timing.status === "current"
                      ? "text-accent"
                      : isNearest
                        ? "text-primary font-bold"
                        : timing.status === "departed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                  >
                    {timing.location}
                  </p>
                  {isNearest && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-bounce-slow">
                      Your Nearby Stand
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{timing.time}</p>
                {timing.eta && (
                  <p className="text-xs font-bold text-accent mt-0.5">ETA: {timing.eta}</p>
                )}
                {timing.status === "current" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-1">
                    <Navigation className="w-3 h-3" />
                    Bus is here
                  </span>
                ) : isNearest && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                    <MapPin className="w-3 h-3" />
                    Expected pickup point
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusTimeline;
