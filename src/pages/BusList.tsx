import { useEffect, useState } from "react";
import { Bus, RefreshCw, Calendar, MapPin } from "lucide-react";
import { Layout } from "@/components/layout";
import { BusCard } from "@/components/bus";
import { SearchFilter, SkeletonCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import AllBusesMap from "@/components/map/AllBusesMap";
import type { Bus as BusType } from "@/types";
import { busService } from "@/services/busService";

const BusList = () => {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [allBuses, setAllBuses] = useState<BusType[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchBusesData = async () => {
    setIsLoading(true);
    try {
      const fetchedBuses = await busService.getAllBuses();
      const fetchedRoutes = await busService.getRoutes();
      setBuses(fetchedBuses);
      setAllBuses(fetchedBuses);
      setRoutes(fetchedRoutes);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch buses data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusesData();
  }, []);

  const handleSearch = (query: string) => {
    if (!query) {
      setBuses(allBuses);
      return;
    }
    const filtered = allBuses.filter(
      (bus) =>
        bus.name.toLowerCase().includes(query.toLowerCase()) ||
        bus.routeFrom.toLowerCase().includes(query.toLowerCase()) ||
        bus.routeTo.toLowerCase().includes(query.toLowerCase())
    );
    setBuses(filtered);
  };

  const handleFilterChange = (filters: { route: string; status: string }) => {
    let filtered = [...allBuses];

    if (filters.route) {
      filtered = filtered.filter((bus) => bus.route === filters.route);
    }

    if (filters.status) {
      filtered = filtered.filter((bus) => bus.status === filters.status);
    }

    setBuses(filtered);
  };

  const handleRefresh = () => {
    fetchBusesData();
  };

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="section-container">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="page-header flex items-center gap-3">
                  <Bus className="w-8 h-8 text-accent" />
                  All Tracked Buses
                </h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{todayDate}</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{buses.length}</p>
                <p className="text-sm text-muted-foreground">Available Today</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-success">
                  {buses.filter((b) => b.status === "on-time").length}
                </p>
                <p className="text-sm text-muted-foreground">On Time</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-info">
                  {buses.filter((b) => b.status === "arriving").length}
                </p>
                <p className="text-sm text-muted-foreground">Arriving Soon</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-warning">
                  {buses.filter((b) => b.status === "delayed").length}
                </p>
                <p className="text-sm text-muted-foreground">Delayed</p>
              </div>
            </div>

            {/* Search & Filter */}
            <SearchFilter
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              routes={routes}
            />

            {/* Last Update Time */}
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          {/* Map View */}
          {!isLoading && allBuses.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-accent" />
                Live Map View
              </h2>
              <AllBusesMap initialBuses={allBuses} />
            </div>
          )}

          {/* Bus List */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : buses.length === 0 ? (
            <div className="text-center py-16">
              <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No buses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find available buses.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buses.map((bus, index) => (
                <div
                  key={bus.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <BusCard {...bus} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BusList;
