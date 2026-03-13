import { useState, useEffect, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Bus, Search, RefreshCw, User as UserIcon, Plus, Clock, Navigation } from "lucide-react";
import { busService } from "@/services/busService";
import { authService } from "@/services/authService";
import type { Bus as BusType, User } from "@/types";
import { BusCard } from "@/components/bus";
import { SkeletonCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import AllBusesMap from "@/components/map/AllBusesMap";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useNavigate as routerNavigate } from "react-router-dom";

const StatusLegend = ({ t }: { t: (key: string) => string }) => (
    <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 mb-8 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("active")}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("on_route")}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("delayed")}</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("inactive")}</span>
        </div>
    </div>
);

const MetricCard = ({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: React.ElementType }) => (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-lg transition-all">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
        </div>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", color)}>
            <Icon className="w-7 h-7" />
        </div>
    </div>
);

const QuickActionCard = ({ title, desc, icon: Icon, color, onClick }: { title: string, desc: string, icon: React.ElementType, color: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left overflow-hidden w-full"
    >
        <div className={cn("inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4 transition-transform group-hover:scale-110", color)}>
            <Icon className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-black text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
        <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-24 h-24" />
        </div>
    </button>
);

const AnnouncementTicker = () => (
    <div className="bg-slate-900 overflow-hidden py-3 relative z-20">
        <div className="flex animate-scroll whitespace-nowrap gap-12">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Terminal Update: Platform 3 is undergoing maintenance. All Thoothukudi services shifted to Platform 4
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Safety: Please keep your belongings safe and monitor real-time ETA via Buzzo
                </div>
            ))}
        </div>
    </div>
);

const PassengerDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [buses, setBuses] = useState<BusType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<number | 'all'>('all');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [routes, setRoutes] = useState<string[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const navigate = routerNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = useCallback(async (pageNum = 1, append = false) => {
        if (!append) setIsLoading(true);

        try {
            // Get user first so shell renders immediately
            if (!user) {
                const currentUser = await authService.getCurrentUser();
                if (!currentUser) {
                    navigate("/auth");
                    return;
                }
                setUser(currentUser);
            }

            // Fetch data in background/parallel
            const [newBuses, availableRoutes] = await Promise.all([
                busService.getAllBuses(!append, pageNum, 50),
                busService.getRoutes()
            ]);

            if (Array.isArray(availableRoutes)) {
                setRoutes(availableRoutes);
            } else {
                setRoutes([]);
            }

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
    }, [user, navigate]);

    useEffect(() => {
        fetchDashboardData(1, false);
    }, [fetchDashboardData]);

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

    const filteredBuses = (Array.isArray(buses) ? buses : []).filter((bus) => {
        if (!bus) return false;
        
        const name = bus.name || "";
        const busNumber = bus.busNumber || "";
        const routeFrom = bus.routeFrom || "";
        const routeTo = bus.routeTo || "";
        const query = (searchQuery || "").toLowerCase();

        const matchesSearch =
            name.toLowerCase().includes(query) ||
            busNumber.toLowerCase().includes(query) ||
            routeFrom.toLowerCase().includes(query) ||
            routeTo.toLowerCase().includes(query);

        const matchesPlatform = selectedPlatform === 'all' || bus.platformNumber === selectedPlatform;
        const matchesRoute = selectedRoute === 'all' || `${routeFrom} - ${routeTo}` === selectedRoute;
        const matchesStatus = (selectedStatus === 'all' || bus.status === selectedStatus) && (bus.status !== 'completed'); // Default hide completed in dashboard

        return matchesSearch && matchesPlatform && matchesRoute && matchesStatus;
    });

    const metrics = useMemo(() => {
        const safeBuses = Array.isArray(buses) ? buses : [];
        return {
            total: safeBuses.length,
            active: safeBuses.filter(b => b?.status === 'active' || b?.isActive).length,
            onRoute: safeBuses.filter(b => b?.status === 'on-route').length,
            delayed: safeBuses.filter(b => b?.status === 'delayed').length,
            inactive: safeBuses.filter(b => b?.status === 'inactive').length
        };
    }, [buses]);

    const busesByPlatform = useMemo(() => {
        const groups: Record<number, BusType[]> = {};
        const safeFiltered = Array.isArray(filteredBuses) ? filteredBuses : [];
        
        safeFiltered.forEach(bus => {
            if (!bus) return;
            const p = bus.platformNumber || 1;
            if (!groups[p]) groups[p] = [];
            groups[p].push(bus);
        });
        return groups;
    }, [filteredBuses]);

    if (!user) return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="glass-card rounded-3xl p-8 mb-10 h-64 skeleton" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <AnnouncementTicker />
            <div className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                {format(currentTime, 'EEEE, d MMMM')}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 84°F Clear
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                            {t("good_morning")}, <span className="text-primary italic">{user.name?.split(' ')[0]}</span> 👋
                        </h2>
                        <p className="text-slate-500 font-medium max-w-lg mt-1">
                            {t("terminal_dashboard_ready", { count: metrics.active })}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="hero"
                            size="lg"
                            className="rounded-2xl h-14 px-8 font-black shadow-primary/20 shadow-xl"
                            onClick={() => navigate('/buses')}
                        >
                            <Search className="w-5 h-5 mr-3" />
                            {t("quick_track")}
                        </Button>
                    </div>
                </div>

                {/* Quick Service Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <QuickActionCard
                        title={t("live_radar")}
                        desc="View all buses in your vicinity on a live interactive map."
                        icon={Navigation}
                        color="bg-primary/10 text-primary"
                        onClick={() => navigate('/buses')}
                    />
                    <QuickActionCard
                        title={t("saved_routes")}
                        desc="Quick access to your most frequented daily commute paths."
                        icon={Plus}
                        color="bg-emerald-50 text-emerald-600"
                        onClick={() => {}}
                    />
                    <QuickActionCard
                        title={t("alerts_hub")}
                        desc="Manage your proximity notifications and system updates."
                        icon={Clock}
                        color="bg-amber-50 text-amber-600"
                        onClick={() => {}}
                    />
                    <QuickActionCard
                        title={t("terminal_support")}
                        desc="Live assistance for ticketing and platform inquiries."
                        icon={UserIcon}
                        color="bg-slate-50 text-slate-600"
                        onClick={() => {}}
                    />
                </div>
                {/* Modern Terminal Header */}
                <div className="relative overflow-hidden glass-card rounded-3xl p-8 mb-10 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Bus className="w-48 h-48 rotate-12" />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                                <Plus className="w-3 h-3" /> {t("live_departures")}
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black mb-3 tracking-tight">
                                Tirunelveli <span className="text-primary italic">{t("terminal")}</span>
                            </h1>
                            <div className="flex items-center gap-6">
                                <p className="text-slate-500 text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                                    <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                                    {t("station_time")}: <span className="text-slate-900 ml-1">{format(currentTime, 'hh:mm AA')}</span>
                                </p>
                                <div className="h-4 w-px bg-slate-200" />
                                <p className="text-slate-500 text-sm font-black uppercase tracking-widest">
                                    {t("departures")}: <span className="text-slate-900 ml-1">{filteredBuses.length} Listed</span>
                                </p>
                            </div>
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

                    {/* Quick Search and Multi-Filters */}
                    <div className="mt-10 flex flex-col lg:flex-row gap-4 max-w-5xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Find your bus number or destination..."
                                className="input-field pl-14 h-16 text-xl rounded-full bg-background/80 border-primary/10 hover:border-primary/30 focus:border-primary shadow-inner w-full transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative w-full md:w-64">
                                <select
                                    className="w-full h-16 px-6 pr-10 rounded-full bg-background/80 border border-primary/10 focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-bold text-sm tracking-tight"
                                    value={selectedRoute}
                                    onChange={(e) => setSelectedRoute(e.target.value)}
                                >
                                    <option value="all">ALL ROUTES</option>
                                    {Array.isArray(routes) && routes.map(route => (
                                        <option key={route} value={route}>{route}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative w-full md:w-48">
                                <select
                                    className="w-full h-16 px-6 pr-10 rounded-full bg-background/80 border border-primary/10 focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-bold text-sm tracking-tight uppercase"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="all">ANY STATUS</option>
                                    <option value="active">ACTIVE</option>
                                    <option value="on-route">ON ROUTE</option>
                                    <option value="delayed">DELAYED</option>
                                    <option value="inactive">INACTIVE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <MetricCard label={t("live_services")} value={metrics.active} color="bg-emerald-50 text-emerald-600" icon={Bus} />
                    <MetricCard label={t("on_route")} value={metrics.onRoute} color="bg-blue-50 text-blue-600" icon={Navigation} />
                    <MetricCard label={t("delayed")} value={metrics.delayed} color="bg-rose-50 text-rose-600" icon={Clock} />
                    <MetricCard label={t("total_fleets")} value={metrics.total} color="bg-slate-50 text-slate-600" icon={Search} />
                </div>

                {/* Platform Selector & Legend */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
                        <Button
                            variant={selectedPlatform === 'all' ? "hero" : "outline"}
                            className={cn(
                                "rounded-xl h-12 px-6 font-black transition-all shadow-md uppercase tracking-tighter text-xs",
                                selectedPlatform === 'all' ? "scale-105" : "hover:bg-primary/5 border-primary/10"
                            )}
                            onClick={() => setSelectedPlatform('all')}
                        >
                            {t("all")}
                        </Button>
                        {[1, 2, 3, 4, 5, 6].map((p) => (
                            <Button
                                key={p}
                                variant={selectedPlatform === p ? "accent" : "outline"}
                                className={cn(
                                    "rounded-xl h-12 px-8 font-black transition-all shadow-md text-xs",
                                    selectedPlatform === p ? "scale-105 bg-accent text-white" : "hover:bg-accent/5 border-accent/10 text-accent"
                                )}
                                onClick={() => setSelectedPlatform(p)}
                            >
                                {t("platform")} {p}
                            </Button>
                        ))}
                    </div>
                    <StatusLegend t={t} />
                </div>

                {/* Content Layout: Map + Grid */}
                <div className="flex flex-col xl:flex-row gap-8">

                    {/* Map Section (Mobile: Top, Desktop: Side) */}
                    <div className="w-full xl:w-1/3 xl:sticky xl:top-24 h-fit space-y-6">
                        <div className="glass-card p-2 rounded-2xl shadow-lg bg-card">
                            <h3 className="text-lg font-bold px-4 pt-3 flex items-center gap-2">
                                <Bus className="w-5 h-5 text-accent" /> {t("live_map_view")}
                            </h3>
                            <AllBusesMap initialBuses={filteredBuses} />
                        </div>
                    </div>

                    {/* Bus List Section */}
                    <div className="w-full xl:w-2/3">
                        {/* Bus Grid Header */}
                        <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Bus className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">{t("available_departures")}</h2>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                                        {selectedPlatform === 'all' ? t("across_all_platforms") : t("specifically_from_platform", { platform: selectedPlatform })}
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
                                {t("update_list")}
                            </Button>
                        </div>

                        {isLoading && page === 1 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : filteredBuses.length > 0 ? (
                            <div className="space-y-12">
                                <div className="space-y-12">
                                    {Object.entries(busesByPlatform).sort(([a], [b]) => Number(a) - Number(b)).map(([platform, platformBuses]) => (
                                        <div key={platform} className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                                                    {t("platform")} {platform}
                                                </div>
                                                <div className="h-px bg-slate-100 flex-1" />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {(Array.isArray(platformBuses) ? platformBuses : []).map((bus) => (
                                                    <BusCard key={bus?.id || Math.random()} {...bus} />
                                                ))}
                                            </div>
                                        </div>
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
                                            {t("load_more_buses")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2">
                                <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-bold text-muted-foreground">{t("no_buses_departing")}</h3>
                                <p className="text-muted-foreground">{t("all_scheduled_buses_departed")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PassengerDashboard;
