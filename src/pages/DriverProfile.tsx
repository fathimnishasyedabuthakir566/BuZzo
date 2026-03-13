import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Bus, MapPin, User as UserIcon, Phone, ShieldCheck, LogOut, Settings, Save, X, Activity, Clock, Navigation, History, Car } from "lucide-react";
import { authService } from "@/services/authService";
import { tripService, Trip } from "@/services/tripService";
import { socketService } from "@/services/socketService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";
import { format } from "date-fns";

const MetricCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: React.ElementType, color: string }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const DriverProfile = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
    
    // Using standard fields plus RBAC Driver Specific Fields
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "",
        licenseNumber: "",
        emergencyContact: ""
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const fetchUserAndTrips = useCallback(async () => {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "driver") {
            if (currentUser?.role === "admin") navigate("/admin");
            else if (currentUser) navigate("/profile");
            else navigate("/auth");
            return;
        }
        setUser(currentUser);
        setFormData({
            name: currentUser.name || "",
            phone: currentUser.phone || "",
            city: currentUser.city || "",
            licenseNumber: currentUser.licenseNumber || "",
            emergencyContact: currentUser.emergencyContact || ""
        });

        // Fetch recent trip activity
        const tripRes = await tripService.getMyTrips();
        if (tripRes.success && tripRes.trips) {
            setRecentTrips(tripRes.trips.slice(0, 5)); // Just show 5 recent
        }
    }, [navigate]);

    useEffect(() => {
        fetchUserAndTrips();

        window.addEventListener('user-updated', fetchUserAndTrips);

        // Real-time stat updates via socket.io
        socketService.connect();
        socketService.subscribeToDriverStats((data: { 
            driverId: string; 
            stats: { 
                totalTrips: number; 
                totalDistance: number; 
                drivingHours: number; 
                lastTripTime: string; 
                availabilityStatus: 'Available' | 'On Trip' | 'Offline'; 
            } 
        }) => {
            console.log("Received live stats update:", data);
            setUser(prev => {
                if (!prev) return null;
                if (data.driverId === prev.id) {
                    const updatedUser = { 
                        ...prev, 
                        totalTrips: data.stats.totalTrips,
                        totalDistance: data.stats.totalDistance,
                        drivingHours: data.stats.drivingHours,
                        lastTripTime: data.stats.lastTripTime,
                        availabilityStatus: data.stats.availabilityStatus
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    return updatedUser;
                }
                return prev;
            });
            // Also refresh trips to show the newest completed one
            tripService.getMyTrips().then(res => {
                 if (res.success && res.trips) setRecentTrips(res.trips.slice(0, 5));
            });
        });

        return () => {
            window.removeEventListener('user-updated', fetchUserAndTrips);
            socketService.unsubscribeFromDriverStats();
        };
    }, [fetchUserAndTrips]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const response = await authService.updateUserProfile({
                id: user.id,
                ...formData
            });

            if (response.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
            } else {
                toast.error(response.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    const avgDuration = user.totalTrips && user.drivingHours ? (user.drivingHours * 60 / user.totalTrips).toFixed(0) : 0;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Profile Section */}
                <div className="relative overflow-hidden glass-card rounded-3xl p-8 mb-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex-shrink-0 relative">
                        <PhotoUpload
                            userId={user.id}
                            currentPhoto={user.profilePhoto}
                            onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                        />
                        <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${user.availabilityStatus === 'Available' ? 'bg-success' : user.availabilityStatus === 'On Trip' ? 'bg-blue-500' : 'bg-slate-400'}`} title={user.availabilityStatus || 'Offline'} />
                    </div>
                    
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                            <div>
                                <div className="inline-flex py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-widest mb-3">
                                    <ShieldCheck className="w-3 h-3 inline mr-1" /> Verified Driver
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{user.name}</h1>
                                <p className="text-slate-500 font-medium">Driver ID: <span className="text-slate-700 font-bold">{user.id.substring(0,8).toUpperCase()}</span></p>
                            </div>

                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <Button className="rounded-xl gap-2 font-bold shadow-md" onClick={handleSave} disabled={isSaving}>
                                            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button variant="outline" className="rounded-xl gap-2" onClick={() => setIsEditing(false)}>
                                            <X className="w-4 h-4" /> Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" className="rounded-xl gap-2 bg-white/50 backdrop-blur" onClick={() => setIsEditing(true)}>
                                        <Settings className="w-4 h-4" /> Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Editable Form Grid when active, else display standard details */}
                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 bg-white/80 p-6 rounded-2xl glass-card">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">City / Base</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">License Number</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Emergency Contact</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="w-4 h-4 text-primary" /> <span className="font-semibold">{user.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="w-4 h-4 text-primary" /> <span className="font-semibold">{user.city || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Car className="w-4 h-4 text-primary" /> <span className="font-semibold text-sm">License: {user.licenseNumber || 'Not provided'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Driver Statistics (Auto Updating) */}
                <div className="mb-8">
                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Performance Analytics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard label="Total Trips" value={user.totalTrips || 0} icon={Bus} color="bg-primary/10 text-primary" />
                        <MetricCard label="Distance Driven" value={`${(user.totalDistance || 0).toFixed(1)} km`} icon={Navigation} color="bg-emerald-50 text-emerald-600" />
                        <MetricCard label="Driving Hours" value={`${(user.drivingHours || 0).toFixed(1)} hrs`} icon={Clock} color="bg-blue-50 text-blue-600" />
                        <MetricCard label="Avg Duration" value={`${avgDuration} min`} icon={Activity} color="bg-amber-50 text-amber-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Trip Activity Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Recent Trip Activity
                        </h3>
                        {recentTrips.length > 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                {recentTrips.map(trip => (
                                    <div key={trip.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <Bus className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{trip.routeName}</h4>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                                                    <span>{format(new Date(trip.startTime), 'MMM d, yyyy - hh:mm a')}</span>
                                                    {trip.status === 'completed' && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed</span>}
                                                    {trip.status === 'active' && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Active</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 sm:text-right">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance</p>
                                                <p className="font-black text-slate-700">{trip.distanceCovered} km</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duration</p>
                                                <p className="font-black text-slate-700">{Math.round(trip.duration)} min</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                                <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No recent trips found for this account.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access / Controls */}
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden text-center">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            <Bus className="w-10 h-10 opacity-50 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-1">Assigned Vehicle</h3>
                            {user.assignedBus ? (
                                <p className="text-primary font-black text-2xl tracking-widest">{user.assignedBus}</p>
                            ) : (
                                <p className="text-white/60 text-sm">No bus currently assigned.</p>
                            )}
                            <Button 
                                variant="outline" 
                                className="w-full mt-6 bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl"
                                onClick={() => navigate('/driver?view=buses')}
                            >
                                Change Assignment
                            </Button>
                        </div>
                        
                        <Button
                            variant="destructive"
                            className="w-full rounded-2xl h-14 gap-2 font-bold shadow-soft"
                            onClick={() => {
                                authService.logout();
                                navigate("/auth");
                            }}
                        >
                            <LogOut className="w-5 h-5" /> Logout of Driver System
                        </Button>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default DriverProfile;
