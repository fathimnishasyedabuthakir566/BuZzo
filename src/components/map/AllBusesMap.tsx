import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { socketService } from '@/services/socketService';
import L from 'leaflet';
import type { Bus } from '@/types';
import { Link } from 'react-router-dom';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AllBusesMapProps {
    initialBuses: Bus[];
}

const AllBusesMap = ({ initialBuses }: AllBusesMapProps) => {
    const [buses, setBuses] = useState<Bus[]>(initialBuses);

    useEffect(() => {
        setBuses(initialBuses);
    }, [initialBuses]);

    useEffect(() => {
        socketService.connect();

        socketService.subscribeToLocation((data) => {
            setBuses(prev => prev.map(bus =>
                bus.id === data.busId || bus.id === data.routeId
                    ? { ...bus, location: { lat: data.lat, lng: data.lng, lastUpdated: new Date().toISOString() }, status: 'on-time' as any }
                    : bus
            ));
        });

        return () => {
            socketService.unsubscribeFromLocation();
        };
    }, []);

    const center: [number, number] = [8.7139, 77.7567]; // Tirunelveli

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white/10 mb-8 mt-6">
            <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {buses.map(bus => bus.location && (
                    <Marker key={bus.id} position={[bus.location.lat, bus.location.lng]}>
                        <Popup className="rounded-xl overflow-hidden">
                            <div className="p-1">
                                <h3 className="font-bold text-primary">{bus.name}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{bus.routeFrom} → {bus.routeTo}</p>
                                <div className="flex items-center justify-between gap-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bus.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                        {bus.isActive ? 'LIVE' : 'OFFLINE'}
                                    </span>
                                    <Link to={`/bus/${bus.id}`} className="text-xs text-accent font-semibold hover:underline">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AllBusesMap;
