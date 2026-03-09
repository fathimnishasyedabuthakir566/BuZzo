import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { MapPin, Bus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { socketService } from '@/services/socketService';
import L from 'leaflet';
import { cn } from '@/lib/utils';
import { findNearestStop, calculateWalkingTime, calculateRouteDistance } from '@/utils/routeUtils';

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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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
}

const LiveMap = ({ routeId, initialLat = 8.7139, initialLng = 77.7567, stops = [], userLocation }: LiveMapProps) => {
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
        socketService.connect();
        socketService.joinRoute(routeId);

        socketService.subscribeToLocation((data) => {
            setPosition(prev => {
                // Simple bearing calculation
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

    // Custom Bus Marker Iconic Design
    const busIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 bg-primary/20 rounded-full animate-bus-pulse"></div>
                <div class="relative w-10 h-10 bg-primary text-white rounded-xl shadow-2xl border-2 border-white flex items-center justify-center transform transition-transform duration-500 animate-bus-tilt" style="transform: rotate(${bearing}deg)">
                    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16c0 1.1.9 2 2 2h1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h4v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h1c1.1 0 2-.9 2-2V8c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3z"/>
                    </svg>
                </div>
                <div class="absolute -bottom-8 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-border/50 text-[10px] font-bold text-primary whitespace-nowrap uppercase tracking-tighter">
                    TNL · Live
                </div>
            </div>
        `,
        className: 'custom-bus-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    }), [bearing]);

    // User Location Marker
    const userIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                <div class="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping"></div>
            </div>
        `,
        className: 'user-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    }), []);

    const routePositions = useMemo(() => {
        const safeStops = stops || [];
        return [...safeStops].sort((a, b) => (a.order || 0) - (b.order || 0)).map(s => [s.lat, s.lng] as [number, number]);
    }, [stops]);

    // Nearest Stop Logic (Phase 10)
    const nearestStop = useMemo(() => {
        if (userLocation && stops && stops.length > 0) {
            return findNearestStop(userLocation.lat, userLocation.lng, stops);
        }
        return null;
    }, [userLocation, stops]);

    return (
        <div className="h-full w-full relative bg-slate-50">
            <MapContainer
                center={[position.lat, position.lng]}
                zoom={14}
                zoomControl={false}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Animated Glowing Route */}
                {routePositions.length > 1 && (
                    <>
                        <Polyline
                            positions={routePositions}
                            pathOptions={{ color: '#60A5FA', weight: 8, opacity: 0.4, lineJoin: 'round' }}
                            className="animate-route-glow"
                        />
                        <Polyline
                            positions={routePositions}
                            pathOptions={{ color: 'white', weight: 3, opacity: 0.8, dashArray: '10, 15' }}
                            className="route-dash-animate"
                        />
                    </>
                )}

                {/* Elegant Stop Markers */}
                {(stops || []).map((stop, idx) => {
                    const distToStop = calculateDistance(position.lat, position.lng, stop.lat, stop.lng);
                    const etaToStop = Math.ceil((distToStop / 40) * 60);
                    const isNearest = nearestStop?.name === stop.name;

                    return (
                        <CircleMarker
                            key={idx}
                            center={[stop.lat, stop.lng]}
                            radius={isNearest ? 8 : 6}
                            pathOptions={{
                                fillColor: isNearest ? '#10B981' : 'white',
                                fillOpacity: 1,
                                color: isNearest ? '#059669' : '#60A5FA',
                                weight: isNearest ? 4 : 3
                            }}
                        >
                            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-white/80 backdrop-blur-sm border-none shadow-sm rounded-md px-1 py-0 text-[9px] font-bold text-slate-700">
                                {stop.name}
                            </Tooltip>
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <p className="font-bold text-sm text-foreground mb-0.5">{stop.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">
                                        Stop #{stop.order} {isNearest && "• Nearest to you"}
                                    </p>
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-accent">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span>{etaToStop < 1 ? 'Arriving' : `${etaToStop} mins away`}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">{distToStop.toFixed(2)} km from bus</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}

                {/* High Fidelity Bus Marker */}
                <Marker position={[position.lat, position.lng]} icon={busIcon} />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <p className="font-bold text-xs">You are here</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <RecenterMap lat={position.lat} lng={position.lng} userLat={userLocation?.lat} userLng={userLocation?.lng} />

                {/* Path from User to Nearest Stop (Phase 10) */}
                {userLocation && nearestStop && (
                    <Polyline
                        positions={[
                            [userLocation.lat, userLocation.lng],
                            [nearestStop.lat, nearestStop.lng]
                        ]}
                        pathOptions={{ color: '#10B981', weight: 4, opacity: 0.8, dashArray: '5, 10' }}
                    />
                )}

                {/* HIGHLIGHT: Path from Nearest Stop to Destination */}
                {userLocation && nearestStop && (
                    <Polyline
                        positions={(() => {
                            const sortedStops = [...stops].sort((a, b) => a.order - b.order);
                            const currentStopIdx = sortedStops.findIndex(s => s.name === nearestStop.name);
                            if (currentStopIdx === -1) return [];
                            return sortedStops.slice(currentStopIdx).map(s => [s.lat, s.lng] as [number, number]);
                        })()}
                        pathOptions={{ color: '#3B82F6', weight: 6, opacity: 0.9, lineJoin: 'round' }}
                    />
                )}

                {/* Path from User to Bus (Secondary) */}
                {userLocation && (
                    <Polyline
                        positions={[
                            [userLocation.lat, userLocation.lng],
                            [position.lat, position.lng]
                        ]}
                        pathOptions={{ color: '#8b5cf6', weight: 2, opacity: 0.3, dashArray: '10, 10' }}
                    />
                )}
            </MapContainer>

            {/* Distance & ETA Info Card (Phase 10 Enhanced) */}
            {userLocation && nearestStop && (
                <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/50 animate-in slide-in-from-left max-w-[280px]">
                    <div className="space-y-4">
                        {/* Segment 1: User to Nearest Stand */}
                        <div className="border-b border-border/50 pb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Step 1: Walk to Stand</p>
                            </div>
                            <p className="text-xs font-bold text-foreground truncate mb-1">To: {nearestStop.name}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-sm font-black text-emerald-600">
                                    <span>{calculateWalkingTime(nearestStop.distance)} min walk</span>
                                </div>
                                <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 font-bold">{nearestStop.distance.toFixed(2)} km</span>
                            </div>
                        </div>

                        {/* Segment 2: Stand to Destination */}
                        <div className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bus className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Step 2: Bus to Destination</p>
                            </div>
                            {(() => {
                                const sortedStops = [...stops].sort((a, b) => a.order - b.order);
                                const lastStop = sortedStops[sortedStops.length - 1];
                                const currentStopIdx = sortedStops.findIndex(s => s.name === nearestStop.name);
                                const standToDestDist = calculateRouteDistance(sortedStops, currentStopIdx);
                                const busEta = Math.ceil((standToDestDist / 35) * 60);

                                return (
                                    <>
                                        <p className="text-xs font-bold text-foreground truncate mb-1">Final: {lastStop?.name}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-sm font-black text-primary">
                                                <span>~{busEta} min ride</span>
                                            </div>
                                            <span className="text-[10px] bg-primary/5 px-1.5 py-0.5 rounded text-primary font-bold">{standToDestDist.toFixed(1)} km</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Bus Live Relative Status */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Bus is Currently</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-foreground">
                                    {(() => {
                                        const distToStop = calculateDistance(position.lat, position.lng, nearestStop.lat, nearestStop.lng);
                                        const busEtaToStop = Math.ceil((distToStop / 35) * 60);
                                        return busEtaToStop < 1 ? "Arriving at your stop" : `${busEtaToStop} min from your stop`;
                                    })()}
                                </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Exact location: {calculateDistance(userLocation.lat, userLocation.lng, position.lat, position.lng).toFixed(2)} km from you</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default LiveMap;
