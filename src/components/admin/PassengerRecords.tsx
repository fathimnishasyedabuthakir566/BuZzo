import { useState, useEffect } from "react";
import { authService, UserActivity } from "@/services/authService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Mail, Clock, Shield, Database } from "lucide-react";
import { toast } from "sonner";

export const PassengerRecords = () => {
    const [passengers, setPassengers] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPassengers = async () => {
            try {
                const data = await authService.getUserActivity();
                // Filter for passengers (users who are not admins or drivers)
                setPassengers(data.filter(u => u.role !== 'admin' && u.role !== 'driver'));
            } catch (error) {
                toast.error("Failed to load passenger records");
            } finally {
                setLoading(false);
            }
        };
        fetchPassengers();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Accessing passenger database...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="glass-card p-4 rounded-xl border border-primary/10">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Passengers</p>
                    <p className="text-2xl font-black">{passengers.length}</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-primary/10">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Active Sessions</p>
                    <p className="text-2xl font-black">{passengers.filter(p => !p.isBlocked).length}</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-primary/10">
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Data Points</p>
                    <p className="text-2xl font-black flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        {passengers.length * 8}
                    </p>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-primary/5 shadow-inner">
                <Table>
                    <TableHeader className="bg-secondary/50">
                        <TableRow>
                            <TableHead className="font-bold">Passenger Details</TableHead>
                            <TableHead className="font-bold">Email / Contact</TableHead>
                            <TableHead className="font-bold">Last Activity</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {passengers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    No passenger records found in current scope.
                                </TableCell>
                            </TableRow>
                        ) : (
                            passengers.map((p) => (
                                <TableRow key={p._id} className="hover:bg-accent/5 transition-colors group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{p.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">ID: {p._id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-3 h-3 text-muted-foreground" />
                                                {p.email}
                                            </div>
                                            {p.phone && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {p.phone}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-medium">{p.lastActive ? new Date(p.lastActive).toLocaleDateString() : 'Never'}</p>
                                        <p className="text-[10px] text-muted-foreground">{p.lastActive ? new Date(p.lastActive).toLocaleTimeString() : '--'}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${p.isBlocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <Shield className="w-3 h-3" />
                                            {p.isBlocked ? 'Suspended' : 'Verified'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
