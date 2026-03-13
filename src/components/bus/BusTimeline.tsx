import { Navigation, MapPin, Clock } from "lucide-react";
import type { BusTiming } from "@/types";
import { cn } from "@/lib/utils";

interface BusTimelineProps {
  timings: BusTiming[];
  nearestStopName?: string;
  showCardWrapper?: boolean;
}

const BusTimeline = ({ timings, nearestStopName, showCardWrapper = false }: BusTimelineProps) => {
  const content = (
    <div className="space-y-6">
      {(Array.isArray(timings) ? timings : []).map((timing, index) => {
        const isNearest = nearestStopName === timing.location;
        const isCurrent = timing.status === "current";
        const isDeparted = timing.status === "departed";
        
        return (
          <div key={index} className="flex items-start gap-4">
            <div className="flex flex-col items-center pt-1">
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-500 z-10",
                  isDeparted ? "bg-slate-300" : 
                  isCurrent ? "bg-emerald-500 scale-125 ring-4 ring-emerald-500/20" : 
                  isNearest ? "bg-blue-600 ring-4 ring-blue-600/20" : 
                  "bg-slate-200"
                )}
              />
              {index < timings.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-16 -mt-1 transition-colors duration-500",
                    isDeparted ? "bg-slate-200" : "bg-slate-100"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <p
                  className={cn(
                    "text-sm font-black transition-colors",
                    isCurrent ? "text-emerald-600" : 
                    isNearest ? "text-blue-700" : 
                    isDeparted ? "text-slate-400" : 
                    "text-slate-700"
                  )}
                >
                  {timing.location}
                </p>
                {isNearest && (
                  <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    BOARDING POINT
                  </span>
                )}
                {isCurrent && (
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                    CURRENT POSITION
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-bold leading-none">{timing.time}</span>
                 </div>
                 {timing.eta && (
                   <div className="flex items-center gap-1.5 text-primary">
                      <Navigation className="w-3 h-3" />
                      <span className="text-xs font-black tracking-tighter leading-none">ETA: {timing.eta}</span>
                   </div>
                 )}
              </div>

              {isCurrent ? (
                <div className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-100/50 inline-flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Broadcasting</span>
                </div>
              ) : isNearest && (
                <div className="mt-3 py-1.5 px-3 rounded-xl bg-blue-50 border border-blue-100/50 inline-flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Optimized Pickup</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (showCardWrapper) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
           </div>
           <h2 className="text-lg font-black text-slate-800 tracking-tight">Today's Radar Schedule</h2>
        </div>
        {content}
      </div>
    );
  }

  return content;
};

export default BusTimeline;
