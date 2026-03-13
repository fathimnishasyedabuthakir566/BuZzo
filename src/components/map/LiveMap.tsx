import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { MapPin, Bus as BusIcon, Navigation, Flag, Info, Gauge } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { socketService } from '@/services/socketService';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import { 
    calculateDistance, 
    calculateETA, 
    formatETA, 
    dijkstra, 
    getShortestPath, 
    Graph, 
    findNearestStop,
    calculateWalkingTime, 
    calculateRouteDistance 
} from '@/utils/routeUtils';

// Component to recenter map when coords change
const RecenterMap = ({ lat, lng, userLat, userLng }: { lat: number; lng: number, userLat?: number, userLng?: number }) => {
    const map = useMap();
    useEffect(() => {
        if (userLat && userLng) {
            const bounds = L.latLngBounds([
                [lat, lng],
                [userLat, userLng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        } else {
            map.setView([lat, lng], map.getZoom(), { animate: true });
        }
    }, [lat, lng, userLat, userLng, map]);
    return null;
}

interface LiveMapProps {
    routeId: string;
    initialLat?: number;
    initialLng?: number;
    stops?: {
        name: string;
        lat: number;
        lng: number;
        order: number;
    }[];
    userLocation?: { lat: number; lng: number };
    busNumber?: string;
    capacity?: number;
    availableSeats?: number;
    speed?: number;
    nextStop?: string;
}

const LiveMap = ({ 
    routeId, 
    initialLat = 8.7139, 
    initialLng = 77.7567, 
    stops = [], 
    userLocation, 
    busNumber, 
    capacity,
    availableSeats,
    speed,
    nextStop
}: LiveMapProps) => {
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
    const [bearing, setBearing] = useState(0);
    const markerRef = useRef<L.Marker>(null);

    // Smooth position interpolation simulation
    const [displayPosition, setDisplayPosition] = useState(position);

    useEffect(() => {
        socketService.connect();
        socketService.joinRoute(routeId);

        socketService.subscribeToLocation((data) => {
            setPosition(prev => {
                if (prev.lat !== data.lat || prev.lng !== data.lng) {
                    const y = Math.sin(data.lng - prev.lng) * Math.cos(data.lat);
                    const x = Math.cos(prev.lat) * Math.sin(data.lat) -
                        Math.sin(prev.lat) * Math.cos(data.lat) * Math.cos(data.lng - prev.lng);
                    const brng = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
                    setBearing(brng);
                }
                return { lat: data.lat, lng: data.lng };
            });
        });

        return () => {
            socketService.unsubscribeFromLocation();
            socketService.disconnect();
        };
    }, [routeId]);

    // Handle smooth interpolation
    useEffect(() => {
        setDisplayPosition(position);
    }, [position]);

    const busIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-14 h-14 bg-primary/10 rounded-full animate-ping"></div>
                <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-bus-pulse"></div>
                <div class="relative w-10 h-10 bg-primary text-white rounded-xl shadow-2xl border-2 border-white flex items-center justify-center transition-all duration-1000 ease-in-out" style="transform: rotate(${bearing}deg)">
                    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16c0 1.1.9 2 2 2h1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h4v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h1c1.1 0 2-.9 2-2V8c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3z"/>
                    </svg>
                </div>
                ${speed ? `
                <div class="absolute -bottom-6 bg-slate-900 text-white text-[8px] font-black px-1 py-0.5 rounded shadow-lg whitespace-nowrap">
                  ${speed} KM/H
                </div>
                ` : ''}
            </div>
        `,
        className: 'custom-bus-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    }), [bearing, speed]);

    const userIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div class="absolute -top-8 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap uppercase tracking-tighter border border-blue-400">
                    Point 1: User
                </div>
                <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
        `,
        className: 'user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    }), []);

    const routePositions = useMemo(() => {
        const safeStops = stops || [];
        return [...safeStops].sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => [s.lat, s.lng] as [number, number]);
    }, [stops]);

    const nearestStopPoint = useMemo(() => {
        if (userLocation && stops && stops.length > 0) {
            return findNearestStop(userLocation.lat, userLocation.lng, stops);
        }
        return null;
    }, [userLocation, stops]);

    const destinationStop = useMemo(() => {
        if (!stops || stops.length === 0) return null;
        const sorted = [...stops].sort((a, b) => a.order - b.order);
        return sorted[sorted.length - 1];
    }, [stops]);

    const journeyStopsNames = useMemo(() => {
        if (!nearestStopPoint || !destinationStop || !stops || stops.length < 2) return [];
        const graph: Graph = {};
        const sorted = [...stops].sort((a, b) => a.order - b.order);
        for (let i = 0; i < sorted.length - 1; i++) {
            const s1 = sorted[i];
            const s2 = sorted[i+1];
            if (!graph[s1.name]) graph[s1.name] = {};
            graph[s1.name][s2.name] = calculateDistance(s1.lat, s1.lng, s2.lat, s2.lng);
        }
        const { previous } = dijkstra(graph, nearestStopPoint.name);
        return getShortestPath(previous, destinationStop.name);
    }, [stops, nearestStopPoint, destinationStop]);

    const journeyPathCoords = useMemo(() => {
        return journeyStopsNames.map(name => {
            const s = stops.find(st => st.name === name);
            return [s?.lat || 0, s?.lng || 0] as [number, number];
        }).filter(p => p[0] !== 0);
    }, [journeyStopsNames, stops]);

    return (
        <div className="h-full w-full relative bg-slate-50">
            <MapContainer
                center={[displayPosition.lat, displayPosition.lng]}
                zoom={14}
                zoomControl={false}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Main Bus Route Path (Faded) */}
                {routePositions.length > 1 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{ color: '#64748b', weight: 4, opacity: 0.15, lineJoin: 'round' }}
                    />
                )}

                {/* HIGHLIGHT: Point 2 to 3 (Animated Bus Segment) */}
                {journeyPathCoords.length > 0 && (
                    <>
                        <Polyline
                            positions={journeyPathCoords}
                            pathOptions={{ color: '#3B82F6', weight: 8, opacity: 0.2, lineJoin: 'round' }}
                        />
                        <Polyline
                            positions={journeyPathCoords}
                            pathOptions={{ color: '#2563EB', weight: 5, opacity: 1, lineJoin: 'round', dashArray: '1, 15' }}
                            className="animate-pulse"
                        />
                    </>
                )}

                {/* Path from User (Point 1) to Boarding (Point 2) */}
                {userLocation && nearestStopPoint && (
                    <Polyline
                        positions={[
                            [userLocation.lat, userLocation.lng],
                            [nearestStopPoint.lat, nearestStopPoint.lng]
                        ]}
                        pathOptions={{ color: '#10B981', weight: 4, opacity: 0.8, dashArray: '5, 10' }}
                    />
                )}

                {/* Stop Markers */}
                {(stops || []).map((stop, idx) => {
                    const isBoarding = nearestStopPoint?.name === stop.name;
                    const isDestination = destinationStop?.name === stop.name;
                    const isNext = nextStop === stop.name;
                    const isIntermediate = journeyStopsNames.includes(stop.name) && !isBoarding && !isDestination;
                    const isRelevant = journeyStopsNames.includes(stop.name);
                    
                    const distToStop = calculateDistance(displayPosition.lat, displayPosition.lng, stop.lat, stop.lng);
                    const etaToStop = Math.ceil((distToStop / 35) * 60);

                    return (
                        <CircleMarker
                            key={idx}
                            center={[stop.lat, stop.lng]}
                            radius={isNext ? 12 : (isBoarding || isDestination ? 10 : (isIntermediate ? 6 : 4))}
                            pathOptions={{
                                fillColor: isNext ? '#6366f1' : (isBoarding ? '#10B981' : isDestination ? '#EF4444' : (isIntermediate ? '#3B82F6' : '#cbd5e1')),
                                fillOpacity: isRelevant || isNext ? 1 : 0.4,
                                color: isNext ? '#4f46e5' : (isBoarding ? '#059669' : isDestination ? '#B91C1C' : (isIntermediate ? '#2563EB' : '#94a3b8')),
                                weight: isNext ? 6 : (isBoarding || isDestination ? 4 : (isIntermediate ? 2 : 1))
                            }}
                        >
                            <Tooltip permanent direction="top" offset={[0, -10]} className={cn(
                                "bg-white/95 backdrop-blur-md border-none shadow-2xl rounded-2xl px-3 py-1 text-[11px] font-black uppercase tracking-widest transition-all",
                                isNext ? "text-indigo-700 border-b-4 border-indigo-500 scale-110 z-[1000]" :
                                isBoarding ? "text-emerald-700 border-b-2 border-emerald-500" : 
                                isDestination ? "text-rose-700 border-b-4 border-rose-500 text-sm animate-bounce-slow" :
                                isIntermediate ? "text-blue-700" : "text-slate-400 opacity-50"
                            )}>
                                {isNext && "→ Next Stop: "}
                                {isBoarding && "📍 Point 2: "}
                                {isDestination && "🏁 Point 3: "}
                                {stop.name}
                            </Tooltip>
                            
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[150px]">
                                    <p className="font-black text-slate-800 text-base mb-1">{stop.name}</p>
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                                        isNext ? "bg-indigo-100 text-indigo-700" :
                                        isBoarding ? "bg-emerald-100 text-emerald-700" :
                                        isDestination ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                                      )}>
                                        {isNext ? "Next Pickup" : isBoarding ? "Your Stand" : isDestination ? "End Goal" : "Route Node"}
                                      </span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
                                       <span className="text-xs font-black text-slate-700">{distToStop.toFixed(2)} KM</span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between mt-2">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase">Ride Time</span>
                                       <span className="text-xs font-black text-primary">{etaToStop < 1 ? 'Arriving' : `${etaToStop} MINS`}</span>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}

                {/* Bus Marker */}
                <Marker position={[displayPosition.lat, displayPosition.lng]} icon={busIcon} ref={markerRef} />

                {/* User Marker (Point 1) */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup className="custom-popup">
                            <div className="p-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                                   <Navigation className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="font-black text-slate-800 text-sm uppercase mb-1">Point 1: User Position</p>
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                   Tracking your relative distance to Point 2 (Boarding) and Point 3 (Destination).
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <RecenterMap lat={displayPosition.lat} lng={displayPosition.lng} userLat={userLocation?.lat} userLng={userLocation?.lng} />
            </MapContainer>

            {/* Float Info Card */}
            {userLocation && nearestStopPoint && (
                <div className="absolute top-6 left-6 z-[400] bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/50 animate-in slide-in-from-left duration-700 max-w-[300px]">
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-[1.5rem] shadow-xl">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speed Radar</span>
                                <div className="flex items-center gap-2">
                                   <Gauge className="w-4 h-4 text-emerald-400" />
                                   <span className="text-lg font-black">{speed || '0'} <span className="text-[10px] text-slate-500">KM/H</span></span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/10 mx-2"></div>
                            <div className="flex flex-col gap-1 text-right">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats</span>
                                <span className="text-lg font-black text-emerald-400">{availableSeats || '0'}<span className="text-[10px] text-slate-500">/${capacity || '0'}</span></span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 shadow-xl shadow-blue-200 flex items-center justify-center shrink-0 border-2 border-white">
                                    <Navigation className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Point 1</p>
                                    <p className="text-sm font-black text-slate-800">Your Base</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{calculateWalkingTime(nearestStopPoint.distance)} MIN WALK TO BOARDING</p>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-200 flex items-center justify-center shrink-0 border-2 border-white">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Point 2</p>
                                    <p className="text-sm font-black text-slate-800 truncate">{nearestStopPoint.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">BUS IS {calculateDistance(displayPosition.lat, displayPosition.lng, nearestStopPoint.lat, nearestStopPoint.lng).toFixed(1)} KM AWAY</p>
                                </div>
                            </div>

                            <div className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-2xl bg-rose-600 shadow-xl shadow-rose-200 flex items-center justify-center shrink-0 border-2 border-white">
                                    <Flag className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Point 3</p>
                                    <p className="text-sm font-black text-slate-800 truncate">{destinationStop?.name || 'Destination'}</p>
                                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-rose-500 rounded-full animate-progress" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {nextStop && (
                           <div className="pt-2">
                              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                                    <Info className="w-4 h-4 text-white" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Next Approach</p>
                                    <p className="text-xs font-black text-indigo-900 truncate">{nextStop}</p>
                                 </div>
                              </div>
                           </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMap;
