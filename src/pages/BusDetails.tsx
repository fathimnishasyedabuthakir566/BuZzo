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

const BusDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bus, setBus] = useState<BusDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState<string>("");

  const { coordinates: userLocation, requestLocation, permissionStatus } = useGeoLocation();

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
          return {
            ...prevBus,
            location: {
              lat: data.lat,
              lng: data.lng,
              lastUpdated: new Date().toISOString()
            },
            currentStop: data.currentStop,
            nextStop: data.nextStop
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

        {/* Location Permission Button */}
        {permissionStatus === 'prompt' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] w-full max-w-xs px-4">
            <Button
              onClick={requestLocation}
              className="w-full bg-primary shadow-xl animate-bounce-in"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Enable Live Location
            </Button>
          </div>
        )}
        {permissionStatus === 'denied' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] w-full max-w-xs px-4">
            <div className="bg-destructive/90 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Location access denied
            </div>
          </div>
        )}

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
            <BusInfoCard
              busNumber={bus.busNumber}
              capacity={bus.capacity}
              ac={bus.ac}
            />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">Route Stoppages</h3>
            <BusTimeline timings={bus.timings || []} />
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
