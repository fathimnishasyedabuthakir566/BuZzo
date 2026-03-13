import { useState, useEffect, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Bus as BusIcon, MapPin } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import BusEntryCard from "@/components/bus/BusEntryCard";
import { LiveStatusPanel } from "@/components/bus";
import { busService } from "@/services/busService";
import { socketService } from "@/services/socketService";
import { Bus } from "@/types";

const BusDirectory = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [selectedDestination, setSelectedDestination] = useState<string>("all");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.error("Error getting location:", error)
            );
        }
    }, []);

    const fetchBuses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await busService.getAllBuses();
            setBuses(data);
        } catch (error) {
            console.error("Failed to fetch buses:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuses();

        socketService.connect();
        socketService.subscribeToLocation((data) => {
            setBuses(prev => prev.map(bus =>
                bus.id === data.busId || bus.id === data.routeId
                    ? {
                        ...bus,
                        location: { lat: data.lat, lng: data.lng, lastUpdated: new Date().toISOString() },
                        status: (data.status as Bus['status']) || bus.status,
                        isActive: data.isActive !== undefined ? data.isActive : true
                    }
                    : bus
            ));
        });

        return () => {
            socketService.unsubscribeFromLocation();
        };
    }, [fetchBuses]);

    const destinations = useMemo(() => {
        const dests = new Set(buses.map(b => b.routeTo));
        return Array.from(dests).sort();
    }, [buses]);

    const busTypes = useMemo(() => {
        const types = new Set(buses.map(b => b.busType).filter(Boolean));
        return Array.from(types).sort();
    }, [buses]);

    const filteredBuses = useMemo(() => {
        return buses.filter(bus => {
            const matchesSearch =
                bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bus.routeTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                bus.routeFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (bus.via && bus.via.some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesType = selectedType === "all" || bus.busType === selectedType;
            const matchesDest = selectedDestination === "all" || bus.routeTo === selectedDestination;

            return matchesSearch && matchesType && matchesDest;
        });
    }, [buses, searchQuery, selectedType, selectedDestination]);

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50/50">
                {/* Hero Section */}
                <div className="bg-primary/5 border-b border-primary/10 py-12">
                    <div className="section-container">
                        <div className="max-w-2xl">
                            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                                TNSTC Bus Directory
                            </h1>
                            <p className="text-lg text-muted-foreground mb-8">
                                Explore comprehensive details, routes, and timings for all TNSTC Tirunelveli services.
                            </p>

                            <LiveStatusPanel buses={buses} className="mb-8" />

                            <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-2xl shadow-sm border border-border">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search bus number, destination, or via..."
                                        className="pl-10 h-12 text-lg border-transparent bg-secondary/30 focus-visible:bg-background transition-colors"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                                        <SelectTrigger className="w-[160px] h-12">
                                            <MapPin className="w-4 h-4 mr-2 opacity-50" />
                                            <SelectValue placeholder="Destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Any Destination</SelectItem>
                                            {destinations.map(d => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger className="w-[150px] h-12">
                                            <BusIcon className="w-4 h-4 mr-2 opacity-50" />
                                            <SelectValue placeholder="Bus Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {busTypes.map(t => (
                                                <SelectItem key={t as string} value={t as string}>{t as string}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="section-container py-12">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">{filteredBuses.length}</span>
                                    Available Services
                                </h2>
                                {/* Add more sorting options here if needed */}
                            </div>

                            {filteredBuses.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredBuses.map((bus) => (
                                        <BusEntryCard key={bus.id} bus={bus} userLocation={userLocation} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No buses found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        We couldn't find any bus services matching your search criteria. Try adjusting your filters.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-4 text-primary"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedType("all");
                                            setSelectedDestination("all");
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BusDirectory;
