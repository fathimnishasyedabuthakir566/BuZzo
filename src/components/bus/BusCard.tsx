import { Link } from "react-router-dom";
import { Bus, MapPin, Clock, ArrowRight, Navigation, Gauge, ChevronRight, Share2, Info } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
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
  scheduledTime: string | string[];
  platformNumber?: number;
  className?: string;
  speed?: number;
  nextStop?: string;
  availableSeats?: number;
  capacity?: number;
  isActive?: boolean;
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
  speed,
  nextStop,
  availableSeats,
  capacity = 45,
  isActive
}: BusCardProps) => {
  const displayScheduledTime = Array.isArray(scheduledTime) ? scheduledTime[0] : scheduledTime;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `Track ${name}`, url: `${window.location.origin}/bus/${id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/bus/${id}`);
    }
  };

  const isLive = isActive || status === 'active' || status === 'on-route';

  return (
    <div className={cn("block group relative", className)}>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden group/card p-6">
        {/* Top Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/card:scale-110 duration-500",
                isLive ? "bg-slate-900 shadow-slate-200" : "bg-slate-100"
            )}>
              <Bus className={cn(
                "w-7 h-7",
                isLive ? "text-white animate-bus-move" : "text-slate-400"
              )} />
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter truncate max-w-[180px]">
                    {name}
                  </h3>
                  {isLive && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                    </div>
                  )}
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                  Platform {platformNumber || '1'} <ChevronRight className="w-3 h-3" /> TNSTC SERVICE
               </p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-black text-slate-400 leading-none mb-1">SCHED</p>
             <p className="text-lg font-black text-slate-900 tracking-tighter">{displayScheduledTime}</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="relative mb-6 p-4 rounded-3xl bg-slate-50 border border-slate-100/50">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Departure</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{routeFrom}</p>
                </div>
                <div className="flex flex-col items-center px-2">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Destination</p>
                    <p className="text-xs font-black text-primary truncate">{routeTo}</p>
                </div>
            </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Navigation className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Distance</p>
                   <p className="text-xs font-black text-slate-800">{eta ? '2.4 KM' : '---'}</p>
                </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Gauge className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase">Speed</p>
                   <p className="text-xs font-black text-slate-800">{speed || '0'} KM/H</p>
                </div>
            </div>
        </div>

        {/* Next Stop & Seats */}
        <div className="flex items-center justify-between gap-2 mb-6 px-2">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <p className="text-[10px] font-bold text-slate-500">
                    Next: <span className="text-slate-900 font-black uppercase">{nextStop || 'Checking...'}</span>
                </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100">
                <p className="text-[9px] font-black text-slate-600 tracking-tighter">
                    {availableSeats || '24'}/{capacity} SEATS
                </p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Link to={`/bus/${id}`} className="flex-1">
                <Button variant="hero" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Track Bus
                </Button>
            </Link>
            <div className="flex gap-2">
                <Link to={`/bus/${id}`} className="flex-1">
                    <Button variant="outline" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200">
                        Details
                    </Button>
                </Link>
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all active:scale-95"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
