import { useState, useEffect } from "react";
import { User, Bus } from "@/types";
import { authService, UserActivity } from "@/services/authService";
import { busService } from "@/services/busService";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Bus as BusIcon, Phone, MapPin, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export const DriverManager = () => {
    const [drivers, setDrivers] = useState<UserActivity[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allUsers, allBuses] = await Promise.all([
                authService.getUserActivity(),
                busService.getAllBuses()
            ]);
            setDrivers(allUsers.filter(u => u.role === 'driver'));
            setBuses(allBuses);
        } catch (error) {
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignBus = async (driverId: string, busId: string) => {
        const success = await authService.updateUserProfile({ id: driverId, assignedBus: busId } as any);
        if (success.success) {
            toast.success("Driver assigned to bus");
            fetchData();
        } else {
            toast.error("Assignment failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading management console...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Driver Management</h2>
                    <p className="text-muted-foreground">Assign personnel to active routes and monitor status</p>
                </div>
                <Button variant="accent" className="rounded-xl gap-2 font-bold shadow-lg">
                    <Plus className="w-4 h-4" />
                    REGISTER NEW DRIVER
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {drivers.map((driver) => (
                    <div key={driver._id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all border border-primary/5">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">{driver.name}</h3>
                                    <p className="text-sm text-muted-foreground font-mono">{driver.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Contact</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-3 h-3 text-primary" />
                                    {driver.phone || 'N/A'}
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/30">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Assignment</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                    <BusIcon className="w-3 h-3" />
                                    {buses.find(b => b.id === (driver as any).assignedBus)?.busNumber || 'UNASSIGNED'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase font-bold px-1">Quick Assign Bus</label>
                            <select
                                className="w-full h-12 px-4 rounded-xl bg-background border border-primary/10 focus:ring-2 focus:ring-primary appearance-none cursor-pointer text-sm font-semibold"
                                value={(driver as any).assignedBus || ""}
                                onChange={(e) => handleAssignBus(driver._id, e.target.value)}
                            >
                                <option value="" disabled>Select Bus to Assign</option>
                                {buses.map(bus => (
                                    <option key={bus.id} value={bus.id}>{bus.busNumber} ({bus.routeFrom} → {bus.routeTo})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
