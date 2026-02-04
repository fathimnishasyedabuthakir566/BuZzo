import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Bus, Search, RefreshCw, User as UserIcon, Plus, Clock } from "lucide-react";
import { busService } from "@/services/busService";
import { authService } from "@/services/authService";
import type { Bus as BusType, User } from "@/types";
import { BusCard } from "@/components/bus";
import { SkeletonCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const PassengerDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [buses, setBuses] = useState<BusType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<number | 'all'>('all');
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async (pageNum = 1, append = false) => {
        if (!append) setIsLoading(true);

        try {
            const [currentUser, newBuses] = await Promise.all([
                authService.getCurrentUser(),
                busService.getAllBuses(!append, pageNum, 50) // increased limit for better platform coverage
            ]);

            if (!currentUser) {
                navigate("/auth");
                return;
            }

            setUser(currentUser);

            if (append) {
                setBuses(prev => [...prev, ...newBuses]);
            } else {
                setBuses(newBuses);
            }

            setHasMore(newBuses.length === 50);
            setIsLoading(false);
        } catch (error) {
            console.error("Dashboard load failed:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(1, false);
    }, [navigate]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchDashboardData(nextPage, true);
    };

    const formatTime = (date: Date) => {
        return date.toTimeString().slice(0, 5);
    };

    const isAfter = (scheduled: string, current: string) => {
        return scheduled >= current;
    };

    const currentFormattedTime = formatTime(currentTime);

    const filteredBuses = buses.filter((bus) => {
        const matchesSearch =
            bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.routeFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.routeTo.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPlatform = selectedPlatform === 'all' || bus.platformNumber === selectedPlatform;
        const isUpcoming = isAfter(bus.scheduledTime, currentFormattedTime);

        return matchesSearch && matchesPlatform && isUpcoming;
    });

    if (!user) return null;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Modern Terminal Header */}
                <div className="relative overflow-hidden glass-card rounded-3xl p-8 mb-10 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Bus className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                                <Plus className="w-3 h-3" /> Live Departures
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
                                Tirunelveli <span className="text-primary italic">Terminal</span>
                            </h1>
                            <p className="text-muted-foreground text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-accent animate-pulse" />
                                Station Time: <span className="font-mono text-foreground font-bold">{currentFormattedTime}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                className="rounded-2xl gap-3 h-16 px-6 border-primary/20 bg-background/50 backdrop-blur-md hover:bg-primary/5 shadow-lg group"
                                onClick={() => navigate('/profile')}
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold truncate">{user.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{user.role}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/30 flex items-center justify-center bg-accent/10 group-hover:scale-105 transition-transform">
                                    {user.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Search */}
                    <div className="mt-10 relative max-w-2xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Find your route, bus number or destination..."
                            className="input-field pl-14 h-16 text-xl rounded-2xl bg-background/80 border-primary/10 hover:border-primary/30 focus:border-primary shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Platform Selector */}
                <div className="mb-10 overflow-x-auto pb-4 no-scrollbar">
                    <div className="flex items-center gap-3 min-w-max">
                        <Button
                            variant={selectedPlatform === 'all' ? "hero" : "outline"}
                            className={cn(
                                "rounded-xl h-12 px-6 font-bold transition-all shadow-md",
                                selectedPlatform === 'all' ? "scale-105" : "hover:bg-primary/5 border-primary/10"
                            )}
                            onClick={() => setSelectedPlatform('all')}
                        >
                            ALL PLATFORMS
                        </Button>
                        {[1, 2, 3, 4, 5, 6].map((p) => (
                            <Button
                                key={p}
                                variant={selectedPlatform === p ? "accent" : "outline"}
                                className={cn(
                                    "rounded-xl h-12 px-8 font-black transition-all shadow-md",
                                    selectedPlatform === p ? "scale-105 bg-accent text-white" : "hover:bg-accent/5 border-accent/10 text-accent"
                                )}
                                onClick={() => setSelectedPlatform(p)}
                            >
                                PLATFORM {p}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Bus Grid Header */}
                <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bus className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Available Departures</h2>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                                {selectedPlatform === 'all' ? 'Across all platforms' : `Specifically from Platform ${selectedPlatform}`}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary gap-2 font-bold px-4"
                        onClick={async () => {
                            setPage(1);
                            fetchDashboardData(1, false);
                        }}
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        UPDATE LIST
                    </Button>
                </div>

                {isLoading && page === 1 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredBuses.length > 0 ? (
                    <div className="space-y-10">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBuses.map((bus) => (
                                <BusCard key={bus.id} {...bus} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center pb-12">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full px-12 h-14 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all gap-3 shadow-lg hover:shadow-primary/10"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    Load More Buses
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2">
                        <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-muted-foreground">No buses found</h3>
                        <p className="text-muted-foreground">Try a different search query</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PassengerDashboard;
