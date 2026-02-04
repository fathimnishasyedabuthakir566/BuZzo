import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import {
    Bus,
    MapPin,
    User as UserIcon,
    Phone,
    Navigation,
    Clock,
    Power,
    Settings,
    LogOut,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard
} from "lucide-react";
import { authService } from "@/services/authService";
import { busService } from "@/services/busService";
import { socketService } from "@/services/socketService";
import type { User, Bus as BusType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Edit2 } from "lucide-react";

const DriverDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [assignedBus, setAssignedBus] = useState<BusType | null>(null);
    const [allBuses, setAllBuses] = useState<BusType[]>([]);
    const [isTracking, setIsTracking] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const watchIdRef = useRef<number | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('view') || 'dashboard';

    useEffect(() => {
        const init = async () => {
            // Parallelize fetching to avoid waterfall delays
            const [currentUser, buses] = await Promise.all([
                authService.getCurrentUser(),
                busService.getAllBuses()
            ]);

            if (!currentUser || currentUser.role !== "driver") {
                navigate("/auth");
                return;
            }

            setUser(currentUser);
            setAllBuses(buses);

            // If user has an assigned bus ID, fetch its details
            if (currentUser.assignedBus) {
                const busDetails = await busService.getBusById(currentUser.assignedBus);
                setAssignedBus(busDetails as any);
            }

            setIsLoading(false);
        };
        init();

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            socketService.disconnect();
        };
    }, [navigate]);

    const handleBusAssignment = async (busId: string) => {
        if (!user) return;

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, assignedBus: busId })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update local storage and state
                localStorage.setItem('user', JSON.stringify({ ...user, assignedBus: busId }));
                setUser({ ...user, assignedBus: busId });

                const busDetails = await busService.getBusById(busId);
                setAssignedBus(busDetails as any);
                toast.success("Bus assigned successfully");
            }
        } catch (error) {
            toast.error("Failed to assign bus");
        }
    };

    const toggleTrip = () => {
        if (isTracking) {
            stopTrip();
        } else {
            startTrip();
        }
    };

    const startTrip = () => {
        if (!assignedBus) {
            toast.error("Please assign a bus first");
            return;
        }

        if (!('geolocation' in navigator)) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        socketService.connect();
        socketService.startTrip(assignedBus.id);

        // Use high accuracy and low timeout for better responsiveness
        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socketService.sendLocation(assignedBus.id, latitude, longitude);
                // Minimize toast spam, just update state
                console.log('Location update sent:', { latitude, longitude });
                setIsTracking(true);
            },
            (error) => {
                let msg = "Location tracking failed.";
                if (error.code === 1) msg = "Location permission denied. Please enable GPS.";
                else if (error.code === 3) msg = "GPS signal lost. Retrying...";

                toast.error(msg);
                if (error.code !== 3) stopTrip();
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        watchIdRef.current = id;
        toast.success("Trip started! Passengers can now track you live.");
    };

    const stopTrip = () => {
        if (assignedBus) {
            socketService.stopTrip(assignedBus.id);
        }

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        socketService.disconnect();
        toast.info("Trip ended. You are now offline.");
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Driver Profile Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card rounded-2xl p-6 shadow-lg">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4 relative overflow-hidden bg-accent/5">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-primary" />
                                    )}
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-card ${isTracking ? 'bg-success' : 'bg-muted'}`} />
                                </div>
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-muted-foreground">{user.city}</p>
                                <span className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                                    Driver
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{user.phone || 'No phone added'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                    <Navigation className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{user.city || 'No city added'}</span>
                                </div>
                            </div>

                            <div className="pt-6 space-y-2">
                                <Button
                                    variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                                    className="w-full rounded-xl gap-3 justify-start px-4"
                                    onClick={() => navigate('/driver?view=dashboard')}
                                >
                                    <LayoutDashboard className="w-4 h-4 text-primary" />
                                    Dashboard
                                </Button>
                                <Button
                                    variant={activeTab === 'buses' ? 'secondary' : 'ghost'}
                                    className="w-full rounded-xl gap-3 justify-start px-4"
                                    onClick={() => navigate('/driver?view=buses')}
                                >
                                    <Bus className="w-4 h-4 text-primary" />
                                    My Buses
                                </Button>
                                <Button
                                    variant={activeTab === 'location' ? 'secondary' : 'ghost'}
                                    className="w-full rounded-xl gap-3 justify-start px-4"
                                    onClick={() => navigate('/driver?view=location')}
                                >
                                    <Navigation className="w-4 h-4 text-primary" />
                                    Update Location
                                </Button>

                                <div className="pt-4 border-t border-border mt-4 space-y-2">
                                    <Button variant="outline" className="w-full rounded-xl gap-3 justify-start px-4" onClick={() => navigate('/driver-profile')}>
                                        <Settings className="w-4 h-4" />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-xl gap-3 justify-start px-4 text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            authService.logout();
                                            navigate("/auth");
                                        }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {activeTab === 'dashboard' && (
                            <>
                                {/* GPS & Status Card */}
                                <div className={`glass-card rounded-2xl p-8 shadow-lg border-2 transition-all duration-500 ${isTracking ? 'border-success/50 bg-success/5' : 'border-transparent'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                                                <Navigation className={`w-5 h-5 ${isTracking ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
                                                Live GPS Status
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {isTracking ? 'Sharing your live location with passengers' : 'GPS tracking is currently disabled'}
                                            </p>
                                        </div>
                                        <Button
                                            size="lg"
                                            className={`rounded-full h-14 px-8 gap-3 transition-all ${isTracking ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}`}
                                            onClick={toggleTrip}
                                        >
                                            <Power className="w-5 h-5" />
                                            {isTracking ? 'Stop Tracking' : 'Enable GPS'}
                                        </Button>
                                    </div>

                                    {!isTracking && (
                                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm">
                                                You must enable GPS tracking while on duty so passengers can track the bus in real-time.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Assigned Bus Details */}
                                <div className="glass-card rounded-2xl p-8 shadow-lg">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Bus className="w-5 h-5 text-primary" />
                                            Current Assignment
                                        </h3>
                                        <div className="flex gap-2">
                                            <select
                                                className="bg-secondary px-3 py-1 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary"
                                                onChange={(e) => handleBusAssignment(e.target.value)}
                                                value={assignedBus?.id || ""}
                                            >
                                                <option value="" disabled>Select a Bus</option>
                                                {allBuses.map(b => (
                                                    <option key={b.id} value={b.id}>{b.busNumber} - {b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {assignedBus ? (
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-secondary/50">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Bus Number</p>
                                                    <p className="text-lg font-bold text-primary">{assignedBus.busNumber}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-secondary/50">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Bus Name</p>
                                                    <p className="font-semibold">{assignedBus.name}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-xl bg-secondary/50">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Current Route</p>
                                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                                        <span>{assignedBus.routeFrom}</span>
                                                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                                        <span>{assignedBus.routeTo}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-secondary/50">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</p>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                                        <span className="text-sm font-medium capitalize">{assignedBus.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
                                            <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                            <p className="text-muted-foreground">No bus assigned today. Please select a bus from the list above.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'buses' && (
                            <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-border bg-secondary/20">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <Bus className="w-5 h-5 text-primary" />
                                        Your Buses
                                    </h3>
                                    <p className="text-sm text-muted-foreground">List of all available buses for your route</p>
                                </div>
                                <div className="divide-y divide-border">
                                    {allBuses.map(bus => (
                                        <div key={bus.id} className="p-6 hover:bg-secondary/30 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${assignedBus?.id === bus.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>
                                                    <Bus className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{bus.busNumber}</h4>
                                                    <p className="text-xs text-muted-foreground">{bus.routeFrom} → {bus.routeTo}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant={assignedBus?.id === bus.id ? "secondary" : "outline"}
                                                    size="sm"
                                                    className="rounded-full gap-2"
                                                    onClick={() => handleBusAssignment(bus.id)}
                                                >
                                                    {assignedBus?.id === bus.id ? 'Currently Assigned' : 'Select Bus'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => navigate(`/bus/${bus.id}`)}
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'location' && (
                            <div className="glass-card rounded-2xl p-12 text-center shadow-lg">
                                <MapPin className={`w-16 h-16 mx-auto mb-6 ${isTracking ? 'text-success animate-bounce' : 'text-primary/20'}`} />
                                <h3 className="text-2xl font-bold mb-2">GPS Tracking Control</h3>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Use this panel to manually start or stop your location broadcasting.
                                </p>
                                <div className="flex flex-col items-center gap-4">
                                    <Button
                                        size="lg"
                                        className={`rounded-full h-16 px-12 gap-3 text-lg font-bold transition-all shadow-xl ${isTracking ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}`}
                                        onClick={toggleTrip}
                                    >
                                        <Power className="w-6 h-6" />
                                        {isTracking ? 'End Trip & Go Offline' : 'Start Trip & Go Live'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        {isTracking ? 'Passengers can currently see your live location.' : 'You are currently hidden from passengers.'}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DriverDashboard;
