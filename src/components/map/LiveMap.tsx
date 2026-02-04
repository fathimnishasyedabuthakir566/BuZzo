import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { socketService } from '@/services/socketService';
import L from 'leaflet';
import { cn } from '@/lib/utils';

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
                <div class="relative w-10 h-10 bg-primary text-white rounded-xl shadow-2xl border-2 border-white flex items-center justify-center transform transition-transform duration-500" style="transform: rotate(${bearing}deg)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M10 14h4"/><path d="M12 10v4"/><path d="M9 18h6"/></svg>
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

    const routePositions = useMemo(() => stops.sort((a, b) => a.order - b.order).map(s => [s.lat, s.lng] as [number, number]), [stops]);

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
                {stops.map((stop, idx) => (
                    <CircleMarker
                        key={idx}
                        center={[stop.lat, stop.lng]}
                        radius={6}
                        pathOptions={{
                            fillColor: 'white',
                            fillOpacity: 1,
                            color: '#60A5FA',
                            weight: 3
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <p className="font-bold text-sm text-foreground mb-0.5">{stop.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Stop #{stop.order}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

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
            </MapContainer>
        </div>
    );
};

export default LiveMap;
