import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { User as UserIcon, ShieldCheck, LogOut, Settings, Save, X, Activity, Server, Users, ShieldAlert, Mail, Phone } from "lucide-react";
import { authService } from "@/services/authService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";

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

const AdminProfile = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        department: "IT & Operations"
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const fetchUser = useCallback(async () => {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser || currentUser.role !== "admin") {
            if (currentUser?.role === "driver") navigate("/driver");
            else if (currentUser) navigate("/profile");
            else navigate("/auth");
            return;
        }
        setUser(currentUser);
        setFormData({
            name: currentUser.name || "",
            phone: currentUser.phone || "",
            department: currentUser.department || "IT & Operations"
        });
    }, [navigate]);

    useEffect(() => {
        fetchUser();

        window.addEventListener('user-updated', fetchUser);
        return () => window.removeEventListener('user-updated', fetchUser);
    }, [fetchUser]);

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

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                
                {/* Header Profile Section */}
                <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8 border border-slate-800">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    
                    <div className="flex-shrink-0 relative z-10">
                        <PhotoUpload
                            userId={user.id}
                            currentPhoto={user.profilePhoto}
                            onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                        />
                    </div>
                    
                    <div className="flex-1 w-full text-center md:text-left z-10">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 text-white">
                            <div>
                                <div className="inline-flex py-1 px-3 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest mb-3 shadow-inner">
                                    <ShieldAlert className="w-3 h-3 inline mr-1" /> System Administrator
                                </div>
                                <h1 className="text-3xl font-black tracking-tight mb-1">{user.name}</h1>
                                <p className="text-slate-400 font-medium tracking-wide">Admin ID: <span className="text-slate-300 font-bold">{user.id.substring(0,8).toUpperCase()}</span></p>
                            </div>

                            <div className="flex items-center gap-3">
                                {isEditing ? (
                                    <>
                                        <Button className="rounded-xl gap-2 font-bold shadow-md bg-white text-black hover:bg-slate-200" onClick={handleSave} disabled={isSaving}>
                                            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button variant="outline" className="rounded-xl gap-2 border-slate-600 hover:bg-slate-800 text-white" onClick={() => setIsEditing(false)}>
                                            <X className="w-4 h-4" /> Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" className="rounded-xl gap-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-white backdrop-blur" onClick={() => setIsEditing(true)}>
                                        <Settings className="w-4 h-4" /> Settings
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Editable Form */}
                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Phone Number</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-600 focus:border-primary text-white outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
                                    <input type="text" className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-600 focus:border-primary text-white outline-none" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-x-8 gap-y-4 mt-8">
                                <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50">
                                    <Mail className="w-4 h-4 text-slate-400" /> <span className="font-semibold text-sm">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50">
                                    <Phone className="w-4 h-4 text-slate-400" /> <span className="font-semibold text-sm">{user.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50">
                                    <Activity className="w-4 h-4 text-slate-400" /> <span className="font-semibold text-sm">Dept: {formData.department}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Admin Status / Stats */}
                    <div className="lg:col-span-3 space-y-6">
                        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" /> System Overview
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <MetricCard label="System Status" value="Online" icon={ShieldCheck} color="bg-emerald-100 text-emerald-600" />
                            <MetricCard label="Access Level" value="Root" icon={ShieldAlert} color="bg-red-100 text-red-600" />
                            <MetricCard label="Platform" value="Buzzo v2" icon={Server} color="bg-blue-100 text-blue-600" />
                        </div>
                        
                        <div className="glass-card rounded-3xl p-8 shadow-sm">
                            <h4 className="font-bold text-lg mb-2">Administrative Privileges</h4>
                            <p className="text-slate-500 text-sm mb-6">As a system administrator, your profile dictates the configuration of the overarching platform. Ensure your contact details are up to date for emergency server alerts.</p>
                            
                            <Button className="w-full sm:w-auto rounded-xl gap-2 font-bold" onClick={() => navigate("/admin")}>
                                <Activity className="w-4 h-4"/> Return to Control Center
                            </Button>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-4">
                        <Button
                            variant="destructive"
                            className="w-full rounded-2xl h-14 gap-2 font-bold shadow-soft"
                            onClick={() => {
                                authService.logout();
                                navigate("/auth");
                            }}
                        >
                            <LogOut className="w-5 h-5" /> Logout of Root
                        </Button>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default AdminProfile;
