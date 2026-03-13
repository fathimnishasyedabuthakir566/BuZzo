import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { socketService } from '@/services/socketService';
import L from 'leaflet';
import type { Bus, BusStatus } from '@/types';
import { Link } from 'react-router-dom';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
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
            setBuses(prev => prev.map(bus => {
                const isMatch = bus.id === data.busId || bus.id === data.routeId;
                if (!isMatch) return bus;

                return {
                    ...bus,
                    location: { 
                        lat: data.lat, 
                        lng: data.lng, 
                        lastUpdated: data.lastUpdated || new Date().toISOString() 
                    },
                    status: (data.status as BusStatus) || bus.status || 'on-time',
                    isActive: data.isActive !== undefined ? data.isActive : true,
                    currentStop: data.currentStop || bus.currentStop,
                    nextStop: data.nextStop || bus.nextStop
                };
            }));
        });

        return () => {
            socketService.unsubscribeFromLocation();
        };
    }, []);

    const center: [number, number] = [8.7139, 77.7567]; // Tirunelveli

    const getStatusColor = (status: string | undefined, isActive: boolean) => {
        if (!isActive) return 'bg-gray-500';
        switch (status?.toLowerCase()) {
            case 'on-time': return 'bg-green-500';
            case 'active': return 'bg-blue-500';
            case 'delayed': return 'bg-amber-500';
            case 'arrived': return 'bg-emerald-500';
            default: return 'bg-primary';
        }
    };

    const busIcon = (status: string | undefined, isActive: boolean) => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-10 h-10 ${getStatusColor(status, isActive)}/20 rounded-full ${isActive ? 'animate-bus-pulse' : ''}"></div>
                <div class="relative w-8 h-8 ${getStatusColor(status, isActive)} text-white rounded-lg shadow-xl border-2 border-white flex items-center justify-center ${isActive ? 'animate-bus-tilt' : ''}">
                    <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16c0 1.1.9 2 2 2h1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h4v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h1c1.1 0 2-.9 2-2V8c0-2.76-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v8zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3z"/>
                    </svg>
                </div>
            </div>
        `,
        className: 'custom-bus-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return (
        <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white/10 mb-8 mt-6">
            <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {buses.map(bus => bus.location && (
                    <Marker key={bus.id} position={[bus.location.lat, bus.location.lng]} icon={busIcon(bus.status, bus.isActive)}>
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
