import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Bus as BusIcon,
  MapPin,
  ArrowLeft,
  Share2,
  Signal,
  Navigation,
  AlertCircle
} from "lucide-react";
import LiveMap from "@/components/map/LiveMap";
import { BusTimeline, BusInfoCard, DriverCard } from "@/components/bus";
import { Button } from "@/components/ui/button";
import type { BusDetails as BusDetailsType } from "@/types";
import { busService } from "@/services/busService";
import { socketService } from "@/services/socketService";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useNotifications } from "@/hooks/useNotifications";
import { calculateDistance, calculateETA, formatETA, findNearestStop, calculateRouteDistance, calculateWalkingTime } from "@/utils/routeUtils";

const BusDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<BusDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<string>("");
  const [notifyStop, setNotifyStop] = useState<{ name: string, lat: number, lng: number } | null>(null);

  const [nearestStop, setNearestStop] = useState<{ name: string, lat: number, lng: number, distance: number } | null>(null);
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

          // Enrich timings with ETA
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const matchesStatus = useMemo(() => {
    if (!bus) return null;
    const isOffline = bus.location?.lastUpdated
      ? (Date.now() - new Date(bus.location.lastUpdated).getTime() > 5 * 60 * 1000)
      : true;

    let smartStatus = "Live Tracking";
    let statusColor = "text-success";

    if (bus.status === 'completed') {
      smartStatus = "Service Completed";
      statusColor = "text-muted-foreground";
    } else if (bus.status === 'not-started') {
      smartStatus = "Trip Not Started";
      statusColor = "text-amber-500";
    } else if (bus.status === 'delayed') {
      smartStatus = "Slightly Delayed";
      statusColor = "text-amber-500";
    } else if (isOffline) {
      smartStatus = "Last Seen " + lastSeen;
      statusColor = "text-muted-foreground";
    }

    return { isOffline, smartStatus, statusColor };
  }, [bus, lastSeen]);

  // Nearest Stop Logic
  useEffect(() => {
    if (userLocation && bus?.intermediateStops) {
      const nearest = findNearestStop(userLocation.lat, userLocation.lng, bus.intermediateStops);
      if (nearest) {
        setNearestStop(nearest);
      }
    }
  }, [userLocation, bus?.intermediateStops]);

  // Near Stop Logic (Subtle Delight)
  useEffect(() => {
    if (bus?.eta && parseInt(bus.eta) <= 2 && !matchesStatus?.isOffline) {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [bus?.eta, matchesStatus?.isOffline]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 animate-pulse border-2 border-primary/20 flex items-center justify-center">
            <BusIcon className="w-8 h-8 text-primary animate-bus-move" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
            Locating Bus...
          </div>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-6">
          <BusIcon className="w-10 h-10 text-accent/40" />
        </div>
        <h2 className="text-3xl font-black text-foreground mb-3">No Bus Found</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          We couldn't find a live session for this bus. It might have ended its service or is currently offline.
        </p>
        <Button variant="hero" onClick={() => navigate(-1)} className="rounded-2xl h-14 px-8 w-full sm:w-auto">
          <ArrowLeft className="w-5 h-5" /> Back to Terminal
        </Button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Track ${bus.name}`, url: window.location.href });
    } else {
      // Fallback for desktop/unsupported browsers
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Map Section - 45% mobile height, 60% desktop width */}
      <div className="w-full md:w-[60%] h-[45vh] md:h-screen relative md:sticky md:top-0 order-1 md:order-2 shadow-xl z-20">
        {/* Floating Header on Map for Mobile */}
        <div className="absolute top-4 left-4 z-[400] md:hidden">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-foreground hover:bg-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Location Permission Enforcement (Phase 7) */}
        {permissionStatus !== 'granted' ? (
          <div className="absolute inset-0 z-[400] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Navigation className={cn("w-12 h-12 text-primary", permissionStatus === 'prompt' && "animate-bounce")} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-foreground mb-4 leading-tight">
              {permissionStatus === 'denied' ? 'Location Access Blocked' : 'Enable Live Tracking'}
            </h3>

            <p className="text-base text-muted-foreground mb-8 max-w-[320px] leading-relaxed">
              {permissionStatus === 'denied'
                ? 'You have denied location access. Please enable it in your browser settings to track the bus and find nearby stands.'
                : 'Can I turn on your current location to locate the nearby bus stand from your current location and show the expected bus location?'}
            </p>

            {permissionStatus === 'prompt' && (
              <div className="space-y-4 w-full max-w-[280px]">
                <Button
                  onClick={requestLocation}
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 h-14 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Signal className="w-5 h-5 animate-pulse" />
                  Yes, Turn it On
                </Button>
                <p className="text-xs text-muted-foreground">Your location is only used for this trip</p>
              </div>
            )}

            {permissionStatus === 'denied' && (
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="h-14 px-10 rounded-2xl font-bold border-2"
              >
                Retry After Enabling
              </Button>
            )}
          </div>
        ) : (
          <>
            <LiveMap
              routeId={bus.id}
              initialLat={bus.location?.lat}
              initialLng={bus.location?.lng}
              stops={bus.intermediateStops}
              userLocation={userLocation}
            />

            {/* Status Badge overlay on Map */}
            <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-white/50 flex items-center gap-2">
              {!matchesStatus?.isOffline && !['completed', 'not-started'].includes(bus.status) && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
              )}
              <span className={cn("text-xs font-bold uppercase tracking-wide", matchesStatus?.statusColor)}>
                {matchesStatus?.smartStatus}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Content Section - 55% mobile height, 40% desktop width */}
      <div className="w-full md:w-[40%] md:h-screen md:overflow-y-auto order-2 md:order-1 bg-background border-r border-border">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center p-6 border-b border-border bg-white/50 backdrop-blur sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Trip Details</h1>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Header Info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">{bus.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-secondary px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-foreground">{bus.busNumber}</span>
                  <span>•</span>
                  <span>{bus.routeFrom} to {bus.routeTo}</span>
                </div>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                size="icon"
                className="rounded-xl shrink-0"
                title="Share Live Location"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* ETA Card */}
          {bus.eta && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated Arrival</p>
              <div className="text-4xl font-black text-foreground tracking-tighter">
                {bus.eta.split(' ')[0]}
                <span className="text-lg font-bold text-muted-foreground ml-1.5">{bus.eta.split(' ').slice(1).join(' ')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">at {bus.nextStop}</p>
            </div>
          )}

          {/* Quick Actions / Grid */}
          <div className="grid grid-cols-1 gap-6">
            <DriverCard
              driverName={bus.driverName || "Unknown Driver"}
              driverPhone={bus.driverPhone || ""}
            />

            {/* Service Details Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-2">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Bus Type</span>
                  <span className="font-semibold text-foreground bg-secondary/50 px-2 py-1 rounded inline-block">{bus.busType || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Service Class</span>
                  <span className="font-semibold text-foreground bg-secondary/50 px-2 py-1 rounded inline-block">{bus.serviceType || 'Ordinary'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Depot</span>
                  <span className="font-semibold text-foreground">{bus.depot || 'Tirunelveli'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Via Route</span>
                  <span className="font-semibold text-foreground text-sm leading-tight">
                    {bus.via && bus.via.length > 0 ? bus.via.join(", ") : "Direct"}
                  </span>
                </div>
              </div>
            </div>

            <BusInfoCard
              busNumber={bus.busNumber}
              capacity={bus.capacity}
              ac={bus.ac}
            />
          </div>

          {/* Journey Breakdown Card (Enhanced Distance Tracking) */}
          {userLocation && nearestStop && bus.intermediateStops && (
            <div className="bg-white border-2 border-primary/10 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" /> 
                Your Optimized Journey
              </h3>
              
              <div className="space-y-4">
                {/* Segment 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="w-0.5 h-full bg-slate-200 my-1 border-dashed border"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 1: Get to the stand</p>
                    <p className="text-sm font-bold text-foreground">Walk to {nearestStop.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-emerald-600">{calculateWalkingTime(nearestStop.distance)} mins</span>
                      <span className="text-[10px] text-muted-foreground">({nearestStop.distance.toFixed(2)} km away)</span>
                    </div>
                  </div>
                </div>

                {/* Segment 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <BusIcon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {(() => {
                      const sortedStops = [...bus.intermediateStops!].sort((a, b) => a.order - b.order);
                      const lastStop = sortedStops[sortedStops.length - 1];
                      const currentStopIdx = sortedStops.findIndex(s => s.name === nearestStop.name);
                      const standToDestDist = calculateRouteDistance(sortedStops, currentStopIdx);
                      const busTravelTime = Math.ceil((standToDestDist / 35) * 60);

                      return (
                        <>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 2: Board the bus</p>
                          <p className="text-sm font-bold text-foreground">Ride to {lastStop?.name || bus.routeTo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-primary">~{busTravelTime} mins</span>
                            <span className="text-[10px] text-muted-foreground">({standToDestDist.toFixed(1)} km journey)</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Bus Location</span>
                <span className="text-xs font-black text-slate-700">
                  {bus.location ? `${calculateDistance(userLocation.lat, userLocation.lng, bus.location.lat, bus.location.lng).toFixed(2)} km from you` : 'Locating...'}
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Route Stoppages</h3>
              {notifyStop && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-destructive hover:text-destructive"
                  onClick={() => setNotifyStop(null)}
                >
                  Cancel Alerts
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {(Array.isArray(bus.timings) ? bus.timings : []).map((timing, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex-1">
                    <BusTimeline timings={[timing]} nearestStopName={nearestStop?.name} />
                  </div>
                  {timing.status === "upcoming" && (
                    <Button
                      variant={notifyStop?.name === timing.location ? "hero" : "outline"}
                      size="sm"
                      className={cn(
                        "ml-2 rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider transition-all",
                        notifyStop?.name === timing.location ? "bg-accent text-white" : "opacity-0 group-hover:opacity-100"
                      )}
                      onClick={() => {
                        const stop = bus.intermediateStops?.find(s => s.name === timing.location);
                        if (stop) setNotifyStop({ name: stop.name, lat: stop.lat, lng: stop.lng });
                      }}
                    >
                      {notifyStop?.name === timing.location ? "Alert On" : "Set Alert"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated Footer */}
          <div className="pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Last location update: {lastSeen || 'Waiting for signal...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
