import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Square, User as UserIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminSidebar,
  AdminStats,
  BusListItem,
  QuickUpdatePanel,
  AddBusModal,
  EditBusModal,
} from "@/components/admin";
import type { Bus } from "@/types";
import { socketService } from "@/services/socketService";
import { busService } from "@/services/busService";
import { authService } from "@/services/authService";
import { toast } from "sonner";

// Sample data - will be replaced with API calls
const sampleBuses: Bus[] = [];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('view') || 'dashboard';

  const [user, setUser] = useState<any>(null);
  const [showAddBus, setShowAddBus] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [buses, setBuses] = useState<Bus[]>([]);

  // Tracking State
  const [trackedBusId, setTrackedBusId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const fetchBuses = async () => {
    const data = await busService.getAllBuses(true);
    setBuses(data);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      // Parallelize auth check and data fetching
      const [currentUser] = await Promise.all([
        authService.getCurrentUser(),
        fetchBuses()
      ]);

      if (!currentUser || currentUser.role !== "admin") {
        navigate("/auth");
        return;
      }
      setUser(currentUser);
    };

    initializeDashboard();

    // Connect socket on mount
    socketService.connect();

    return () => {
      // Disconnect on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketService.disconnect();
    };
  }, []);

  const handleStartTracking = (busId: string) => {
    if (trackedBusId) {
      toast.error("You are already tracking a bus. Stop it first.");
      return;
    }

    if (!('geolocation' in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info(`Starting tracking for bus ${busId}...`);
    socketService.joinRoute(busId); // Driver joins the room too
    setTrackedBusId(busId);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socketService.emit('update-location', {
          routeId: busId,
          lat: latitude,
          lng: longitude
        });
      },
      (error) => {
        console.error("Error getting location", error);
        toast.error("Geolocation failed: " + error.message);
        handleStopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    watchIdRef.current = id;
  };

  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackedBusId(null);
    toast.success("Stopped tracking");
  };

  const handleUpdateBus = async (id: string, data: any) => {
    const success = await busService.updateBus(id, data);
    if (success) {
      toast.success("Bus updated successfully");
      setEditingBus(null);
      fetchBuses();
    } else {
      toast.error("Failed to update bus");
    }
  };

  const handleDeleteBus = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      const success = await busService.deleteBus(id);
      if (success) {
        toast.success("Bus deleted successfully");
        fetchBuses();
      } else {
        toast.error("Failed to delete bus");
      }
    }
  };

  const handleCreateBus = async (data: any) => {
    const success = await busService.createBus(data);
    if (success) {
      toast.success("Bus created successfully");
      setShowAddBus(false);
      fetchBuses();
    } else {
      toast.error("Failed to create bus");
    }
  };

  // Quick Update Handler
  const handleQuickUpdate = async (busId: string, data: { currentLocation: string; eta: string }) => {
    try {
      const success = await busService.updateBus(busId, {
        currentLocation: data.currentLocation,
        eta: data.eta
      });

      if (success) {
        toast.success("Location updated successfully");
        fetchBuses(); // Refresh the list
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Failed to update location");
    }
  };

  const filteredBuses = buses.filter(
    (bus) =>
      bus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        userName={user?.name || "Admin"}
        userRole={user?.role === 'admin' ? "System Administrator" : "Bus Operator"}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Control Center</h1>
              <p className="text-muted-foreground">Monitor systems, manage buses, and assign personnel</p>
            </div>

            <div className="flex gap-2">
              {trackedBusId && (
                <Button variant="destructive" onClick={handleStopTracking} className="animate-pulse">
                  <Square className="w-4 h-4 mr-2" fill="currentColor" />
                  Stop Tracking (Live)
                </Button>
              )}
              <Button variant="accent" onClick={() => setShowAddBus(true)}>
                <Plus className="w-4 h-4" />
                Add New Bus
              </Button>
              <Link to="/profile">
                <Button variant="secondary" className="rounded-full w-10 h-10 p-0 border border-border/50 shadow-sm overflow-hidden">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <>
              <AdminStats buses={buses} />
              <div className="mt-6">
                <QuickUpdatePanel buses={buses} onUpdate={handleQuickUpdate} />
              </div>
            </>
          )}

          {activeTab === 'buses' && (
            <div className="glass-card rounded-xl">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Buses</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search buses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {filteredBuses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No buses found. Add one to get started.
                  </div>
                ) : (
                  filteredBuses.map((bus) => (
                    <div key={bus.id} className="relative">
                      {trackedBusId === bus.id && (
                        <div className="absolute inset-0 bg-accent/5 pointer-events-none border-l-4 border-accent" />
                      )}
                      <BusListItem
                        bus={bus}
                        onUpdateLocation={(id) => handleStartTracking(id)}
                        onEdit={() => setEditingBus(bus)}
                        onDelete={(id) => handleDeleteBus(id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="glass-card rounded-xl p-8 text-center border-2 border-dashed border-border">
              <MapPin className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Live Location Management</h2>
              <p className="text-muted-foreground mb-6">Track any bus directly from the list below by clicking "Update Location"</p>
              <div className="bg-secondary/30 p-4 rounded-xl text-left max-w-lg mx-auto mb-8">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Go to <strong>My Buses</strong> tab</li>
                  <li>Click <strong>Update Location</strong> on any bus</li>
                  <li>Tracking will begin and be shared in real-time</li>
                </ul>
              </div>
              <Button variant="accent" onClick={() => navigate('/admin?view=buses')}>
                Go to My Buses
              </Button>
            </div>
          )}
        </div>
      </main>

      <AddBusModal isOpen={showAddBus} onClose={() => setShowAddBus(false)} onSubmit={handleCreateBus} />
      <EditBusModal
        isOpen={!!editingBus}
        bus={editingBus}
        onClose={() => setEditingBus(null)}
        onSubmit={handleUpdateBus}
      />
    </div>
  );
};

export default AdminDashboard;
