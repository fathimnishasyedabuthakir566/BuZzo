import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Bus as BusIcon,
  MapPin,
  ArrowLeft,
  Share2,
  Signal,
  Navigation,
  AlertCircle,
  Flag,
  Clock,
  Gauge,
  Wind,
  ShieldCheck,
  ChevronRight,
  Heart,
  Bell,
  CheckCircle2,
  ArrowRightCircle
} from "lucide-react";
import LiveMap from "@/components/map/LiveMap";
import { DriverCard } from "@/components/bus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusDetails as BusDetailsType } from "@/types";
import { busService } from "@/services/busService";
import { socketService } from "@/services/socketService";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useNotifications } from "@/hooks/useNotifications";
import { calculateDistance, calculateETA, formatETA, findNearestStop, calculateRouteDistance, calculateWalkingTime } from "@/utils/routeUtils";
import { toast } from "sonner";

interface SpecItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}

const SpecItem = ({ icon: Icon, label, value, color = "text-primary" }: SpecItemProps) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-slate-100/50 shadow-sm transition-all hover:shadow-md hover:bg-white group">
    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors bg-slate-50", color.replace('text-', 'bg-').replace('600', '100'))}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{label}</p>
      <p className="text-sm font-black text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

const BusDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<BusDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<string>("");
  const [notifyStop, setNotifyStop] = useState<{ name: string, lat: number, lng: number } | null>(null);

  const [nearestStop, setNearestStop] = useState<{ name: string, lat: number, lng: number, distance: number } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [notifyNear, setNotifyNear] = useState(false);
  const { coordinates: userLocation, requestLocation, permissionStatus } = useGeoLocation();

  useNotifications({
    routeId: id,
    selectedStop: notifyStop,
    radiusKm: 1.0
  });

  const fetchBus = async () => {
    if (!id) return;
    setLoading(true);
    const data = await busService.getBusById(id);
    if (data) {
      setBus(data);
      if (data.location?.lastUpdated) {
        setLastSeen(formatDistanceToNow(new Date(data.location.lastUpdated), { addSuffix: true }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBus();
    socketService.connect();
    if (id) {
      socketService.joinRoute(id);
      socketService.subscribeToLocation((data) => {
        setBus(prevBus => {
          if (!prevBus || prevBus.id !== data.routeId) return prevBus;

          const timingsArray = Array.isArray(prevBus.timings) ? prevBus.timings : [];
          const updatedTimings = timingsArray.map(timing => {
            if (timing.status === "upcoming" && prevBus.intermediateStops) {
              const stop = prevBus.intermediateStops.find(s => s.name === timing.location);
              if (stop && data.lat && data.lng) {
                const dist = calculateDistance(data.lat, data.lng, stop.lat, stop.lng);
                const etaMins = calculateETA(dist);
                return { ...timing, eta: formatETA(etaMins) };
              }
            }
            return timing;
          });

          return {
            ...prevBus,
            location: {
              lat: data.lat,
              lng: data.lng,
              lastUpdated: data.lastUpdated || new Date().toISOString()
            },
            currentStop: data.currentStop as string,
            nextStop: data.nextStop as string,
            timings: updatedTimings
          };
        });
        setLastSeen("just now");
      });
    }
    return () => {
      socketService.unsubscribeFromLocation();
      socketService.disconnect();
    };
  }, [id]);

  const matchesStatus = useMemo(() => {
    if (!bus) return null;
    const isOffline = bus.location?.lastUpdated
      ? (Date.now() - new Date(bus.location.lastUpdated).getTime() > 5 * 60 * 1000)
      : true;

    let smartStatus = "Live Tracking";
    let statusColor = "bg-emerald-500";
    let statusBg = "bg-emerald-50";

    if (bus.status === 'completed') {
      smartStatus = "Service Completed";
      statusColor = "bg-slate-500";
      statusBg = "bg-slate-100";
    } else if (bus.status === 'not-started') {
      smartStatus = "Scheduled";
      statusColor = "bg-amber-500";
      statusBg = "bg-amber-50";
    } else if (bus.status === 'delayed') {
      smartStatus = "Delayed";
      statusColor = "bg-rose-500";
      statusBg = "bg-rose-50";
    } else if (isOffline) {
      smartStatus = "Offline";
      statusColor = "bg-slate-400";
      statusBg = "bg-slate-100";
    }

    return { isOffline, smartStatus, statusColor, statusBg };
  }, [bus, lastSeen]);

  useEffect(() => {
    if (userLocation && bus?.intermediateStops) {
      const nearest = findNearestStop(userLocation.lat, userLocation.lng, bus.intermediateStops);
      if (nearest) {
        setNearestStop(nearest);
      }
    }
  }, [userLocation, bus?.intermediateStops]);

  // Proximity notification logic
  useEffect(() => {
    if (!notifyNear || !userLocation || !bus?.location) return;

    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      bus.location.lat,
      bus.location.lng
    );

    if (dist <= 1.0) {
      toast.success("Bus is very close!", {
        description: `The bus is now within 1km (${dist.toFixed(1)}km) of your current location.`,
        duration: 10000,
      });
      setNotifyNear(false); // Alert once
      if ('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
    }
  }, [notifyNear, userLocation, bus?.location]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 animate-pulse border-2 border-primary/10 flex items-center justify-center">
            <BusIcon className="w-10 h-10 text-primary animate-bus-move" />
          </div>
          <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">Initializing Radar...</p>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-24 h-24 rounded-[2rem] bg-slate-200/50 flex items-center justify-center mb-8 border-4 border-white shadow-xl">
          <AlertCircle className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">Session Terminated</h2>
        <p className="text-slate-500 mb-10 max-w-sm leading-relaxed text-lg">
          The requested bus service is not currently broadcasting its tracking data.
        </p>
        <Button variant="hero" onClick={() => navigate(-1)} className="rounded-2xl h-16 px-10 text-lg shadow-2xl">
          <ArrowLeft className="w-6 h-6 mr-2" /> Return to Terminal
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Track ${bus.name}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const destinationStop = bus.intermediateStops ? [...bus.intermediateStops].sort((a, b) => a.order - b.order).pop() : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* MAP SECTION - 60% Width */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-screen relative z-10 overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
        {/* Mobile Header Overlay */}
        <div className="absolute top-6 left-6 z-[1000] md:hidden">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur shadow-2xl flex items-center justify-center text-slate-800 active:scale-95 transition-all border border-white/50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {permissionStatus !== 'granted' ? (
          <div className="absolute inset-0 z-[1000] bg-white/60 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
             <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 animate-pulse border-4 border-white shadow-xl">
               <Navigation className="w-12 h-12 text-primary" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Radar Locked</h3>
             <p className="text-slate-600 mb-10 max-w-[340px] text-lg leading-relaxed">
               Please enable location services to unlock precise 3-point journey tracking and nearby stand detection.
             </p>
             <Button onClick={requestLocation} className="h-16 px-10 rounded-2xl text-lg font-black bg-primary shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
                Authorize Access
             </Button>
          </div>
        ) : (
          <>
            <LiveMap
              routeId={bus.id}
              initialLat={bus.location?.lat}
              initialLng={bus.location?.lng}
              stops={bus.intermediateStops}
              userLocation={userLocation}
              busNumber={bus.busNumber}
              capacity={bus.capacity}
              availableSeats={bus.availableSeats}
              speed={bus.speed}
              nextStop={bus.nextStop}
            />
            {/* Live Status Pill */}
            <div className="absolute top-6 right-6 z-[1000]">
               <div className={cn("px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 border-2 border-white/80 backdrop-blur-md transition-all", matchesStatus?.statusBg)}>
                  <div className={cn("w-2.5 h-2.5 rounded-full", matchesStatus?.statusColor, !matchesStatus?.isOffline && "animate-pulse")}></div>
                  <span className={cn("text-[11px] font-black uppercase tracking-widest", matchesStatus?.statusColor.replace('bg-', 'text-'))}>
                    {matchesStatus?.smartStatus}
                  </span>
               </div>
            </div>
          </>
        )}
      </div>

      {/* CONTENT SIDEBAR - 40% Width */}
      <div className="w-full md:w-[40%] h-auto md:h-screen md:overflow-y-auto order-2 md:order-1 bg-white relative">
        {/* PREMIUM HEADER SECTION */}
        <div className="sticky top-0 z-[500] bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 md:p-8">
            <div className="flex items-start justify-between mb-8">
              <button onClick={() => navigate(-1)} className="hidden md:flex p-2.5 -ml-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-all">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-3">
                 <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                    isFavorite ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                  )}
                 >
                    <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                 </button>
                 <button onClick={handleShare} className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                    <Share2 className="w-5 h-5" />
                 </button>
              </div>
           </div>

           <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-[0.2em] mb-3 px-3 py-1 uppercase">Trip Radar Active</Badge>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                {bus.routeTo}
              </h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                 <span>{bus.routeFrom}</span>
                 <ChevronRight className="w-4 h-4 text-slate-300" />
                 <span className="text-primary">{bus.routeTo}</span>
              </div>
           </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 pb-32">
            {/* DESTINATION HERO CARD */}
            <div className="relative overflow-hidden p-8 rounded-[3rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl group animate-in zoom-in duration-700">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-24 -mt-24 blur-[80px] group-hover:bg-primary/20 transition-all duration-1000"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-inner">
                           <Flag className="w-7 h-7 text-rose-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Target Endpoint</p>
                           <p className="text-2xl font-black tracking-tighter">{bus.routeTo}</p>
                        </div>
                     </div>
                     {bus.eta && (
                        <div className="text-right">
                           <p className="text-4xl font-black tracking-tighter leading-none text-primary">{bus.eta.split(' ')[0]}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">MIN TO ARRIVAL</p>
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <Gauge className="w-4 h-4 text-emerald-400" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Speed</p>
                        </div>
                        <p className="text-xl font-black">{bus.speed || '0'} <small className="text-[10px] text-slate-600">KM/H</small></p>
                     </div>
                     <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <Navigation className="w-4 h-4 text-blue-400" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Distance</p>
                        </div>
                        <p className="text-xl font-black">{nearestStop?.distance.toFixed(1) || '0.0'} <small className="text-[10px] text-slate-600">KM</small></p>
                     </div>
                  </div>

                  <div className="mt-6">
                     <Button 
                        onClick={() => setNotifyNear(!notifyNear)}
                        className={cn(
                           "w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                           notifyNear ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                     >
                        <Bell className={cn("w-4 h-4 mr-2", notifyNear && "animate-ring")} />
                        {notifyNear ? "Proximity Warning Active" : "Notify When Within 1KM"}
                     </Button>
                  </div>
               </div>
            </div>

           {/* 3-POINT JOURNEY BREAKDOWN */}
           {userLocation && nearestStop && (
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Journey Execution</h3>
                    <div className="h-px bg-slate-100 flex-1 ml-4"></div>
                 </div>

                 <div className="relative space-y-10 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:border-dashed before:border-slate-100">
                    {/* Point 1 */}
                    <div className="relative flex gap-6 group">
                       <div className="w-12 h-12 rounded-2xl bg-blue-600 shadow-xl shadow-blue-200 flex items-center justify-center shrink-0 z-10 border-4 border-white">
                          <Navigation className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1 pt-1.5 translate-y-[-2px]">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded">Point 1</span>
                             <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Your Location</h4>
                          </div>
                          <p className="text-xs font-bold text-slate-400 mb-2">Distance to boarding point: {nearestStop.distance.toFixed(1)} km</p>
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-tighter">
                             <Clock className="w-3 h-3 mr-1" /> {calculateWalkingTime(nearestStop.distance)} MIN WALK
                          </div>
                       </div>
                    </div>

                    {/* Point 2 */}
                    <div className="relative flex gap-6 group">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-200 flex items-center justify-center shrink-0 z-10 border-4 border-white">
                          <MapPin className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1 pt-1.5 translate-y-[-2px]">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded">Point 2</span>
                             <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Boarding Point</h4>
                          </div>
                          <p className="text-sm font-black text-slate-900 mb-1">{nearestStop.name}</p>
                          
                          {/* Intermediate Stoppages List */}
                          {(() => {
                            const sortedStops = [...bus.intermediateStops!].sort((a, b) => a.order - b.order);
                            const currentStopIdx = sortedStops.findIndex(s => s.name === nearestStop.name);
                            if (currentStopIdx !== -1 && currentStopIdx < sortedStops.length - 1) {
                               return (
                                  <div className="mt-4 ml-1 pl-4 border-l-2 border-slate-100 space-y-3">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">En Route Points:</p>
                                     {sortedStops.slice(currentStopIdx + 1, -1).slice(0, 3).map((stop, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-2">
                                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                           <p className="text-[11px] text-slate-500 font-bold">{stop.name}</p>
                                        </div>
                                     ))}
                                     {sortedStops.slice(currentStopIdx + 1, -1).length > 3 && (
                                        <p className="text-[10px] text-primary font-black pl-3 tracking-tighter">
                                           + {sortedStops.slice(currentStopIdx + 1, -1).length - 3} MORE STOPS
                                        </p>
                                     )}
                                  </div>
                               );
                            }
                          })()}
                       </div>
                    </div>

                    {/* Point 3 */}
                    <div className="relative flex gap-6 group">
                       <div className="w-12 h-12 rounded-2xl bg-rose-600 shadow-xl shadow-rose-200 flex items-center justify-center shrink-0 z-10 border-4 border-white">
                          <Flag className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex-1 pt-1.5 translate-y-[-2px]">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black uppercase tracking-[0.1em] text-rose-600 px-1.5 py-0.5 bg-rose-50 rounded">Point 3</span>
                             <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Final Destination</h4>
                          </div>
                          <p className="text-sm font-black text-slate-900 mb-2">{bus.routeTo}</p>
                          {(() => {
                              const sortedStops = [...bus.intermediateStops!].sort((a, b) => a.order - b.order);
                              const currentStopIdx = sortedStops.findIndex(s => s.name === nearestStop.name);
                              const standToDestDist = calculateRouteDistance(sortedStops, currentStopIdx);
                              const busTravelTime = Math.ceil((standToDestDist / 35) * 60);
                              return (
                                 <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black tracking-tighter">
                                    <BusIcon className="w-3 h-3 mr-1" /> RIDE DURATION: ~{busTravelTime} MINS
                                 </div>
                              );
                          })()}
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {/* BUS SPECIFICATIONS GRID */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Bus Architecture</h3>
                 <div className="h-px bg-slate-100 flex-1 ml-4"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <SpecItem icon={BusIcon} label="Identification" value={bus.busNumber} color="text-indigo-600" />
                 <SpecItem icon={Gauge} label="Availability" value={`${bus.availableSeats || 0}/${bus.capacity} SEATS`} color="text-blue-600" />
                 <SpecItem icon={Wind} label="Climate Control" value={bus.ac ? "Active AC" : "Ventilated"} color="text-sky-600" />
                 <SpecItem icon={ShieldCheck} label="Bus Category" value={bus.busType || "Town"} color="text-violet-600" />
              </div>
           </div>

           {/* TEAM SECTION (DRIVER) */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Service Personnel</h3>
                 <div className="h-px bg-slate-100 flex-1 ml-4"></div>
              </div>
               <DriverCard
                driverName={bus.driverName || "Standard Personnel"}
                driverPhone={bus.driverPhone || ""}
                rating={bus.driverRating}
                status={bus.driverStatus}
              />
           </div>

           {/* TRIP PROGRESS TIMELINE SECTION */}
           <div className="space-y-8 pb-20">
              <div className="flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trip Execution Progress</h3>
                 <div className="h-px bg-slate-100 flex-1 ml-4"></div>
              </div>
              
              <div className="space-y-4">
                {(Array.isArray(bus.timings) ? bus.timings : []).map((timing, idx) => {
                  const isPassed = timing.status === 'departed';
                  const isCurrent = timing.status === 'current';
                  const isNext = bus.nextStop === timing.location;

                  return (
                    <div key={idx} className="group relative">
                      <div className={cn(
                        "p-5 rounded-[2rem] border transition-all duration-500",
                        isNext ? "bg-indigo-50 border-indigo-100 shadow-xl shadow-indigo-100/50 scale-[1.02]" : 
                        isCurrent ? "bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-100/50" :
                        isPassed ? "bg-slate-50/50 border-slate-100 opacity-60" : "bg-white border-slate-100 shadow-sm"
                      )}>
                        <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                isPassed ? "bg-slate-200" : isNext ? "bg-indigo-600" : "bg-primary"
                              )}>
                                 {isPassed ? <CheckCircle2 className="w-5 h-5 text-slate-500" /> : 
                                  isNext ? <ArrowRightCircle className="w-5 h-5 text-white animate-pulse" /> :
                                  <Clock className="w-5 h-5 text-white" />}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <p className={cn(
                                      "text-sm font-black transition-colors",
                                      isNext ? "text-indigo-900" : isPassed ? "text-slate-500" : "text-slate-800"
                                    )}>
                                      {timing.location}
                                    </p>
                                    {isNext && <span className="text-[8px] font-black px-1.5 py-0.5 bg-indigo-200 text-indigo-700 rounded uppercase tracking-tighter">NEXT ARRIVAL</span>}
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">{timing.time}</p>
                              </div>
                           </div>

                           {timing.status === "upcoming" && (
                             <Button
                               variant={notifyStop?.name === timing.location ? "hero" : "outline"}
                               size="sm"
                               className={cn(
                                 "rounded-xl px-4 text-[9px] font-black uppercase tracking-widest transition-all",
                                 notifyStop?.name === timing.location ? "bg-rose-500 text-white border-none shadow-lg shadow-rose-200" : "border-slate-200 text-slate-500 hover:text-slate-900"
                               )}
                               onClick={() => {
                                 const stop = bus.intermediateStops?.find(s => s.name === timing.location);
                                 if (stop) setNotifyStop({ name: stop.name, lat: stop.lat, lng: stop.lng });
                               }}
                             >
                               {notifyStop?.name === timing.location ? "Tracking" : "Alert Me"}
                             </Button>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
