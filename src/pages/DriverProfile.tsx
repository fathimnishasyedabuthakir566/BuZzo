import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Bus, MapPin, User as UserIcon, Phone, ShieldCheck, LogOut, Settings, Save, X } from "lucide-react";
import { authService } from "@/services/authService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";

const DriverProfile = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: ""
    });
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser || currentUser.role !== "driver") {
                if (currentUser?.role === "admin") {
                    navigate("/admin");
                } else if (currentUser) {
                    navigate("/profile");
                } else {
                    navigate("/auth");
                }
                return;
            }
            setUser(currentUser);
            setFormData({
                name: currentUser.name,
                phone: currentUser.phone || "",
                city: currentUser.city || ""
            });
        };
        fetchUser();

        window.addEventListener('user-updated', fetchUser);
        return () => window.removeEventListener('user-updated', fetchUser);
    }, [navigate]);

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
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className="glass-card rounded-2xl p-6 shadow-lg animate-fade-in h-auto">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <PhotoUpload
                                    userId={user.id}
                                    currentPhoto={user.profilePhoto}
                                    onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                                />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="mt-4 w-full bg-transparent border-b border-accent/20 text-center font-bold text-lg focus:outline-none focus:border-accent"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                ) : (
                                    <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
                                )}
                                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-semibold mt-2">
                                    Driver
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                    <span>Verified Operator</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone"
                                        />
                                    ) : (
                                        <span>{user.phone || "Not provided"}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Enter city"
                                        />
                                    ) : (
                                        <span>{user.city || "Not provided"}</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 space-y-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            className="w-full rounded-xl gap-2 h-10"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl gap-2 h-10"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: user.name,
                                                    phone: user.phone || "",
                                                    city: user.city || ""
                                                });
                                            }}
                                            disabled={isSaving}
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full rounded-xl gap-2 h-10"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Edit Profile
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full rounded-xl justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                authService.logout();
                                                navigate("/auth");
                                            }}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-8">
                        {/* Bus Details Section - Rest of the file remains same */}
                        <div className="glass-card rounded-2xl p-8 shadow-lg animate-scale-in">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Bus className="w-5 h-5 text-primary" />
                                Your Assigned Bus
                            </h3>

                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-2xl font-bold text-primary">TN-72-AX-1234</h4>
                                        <p className="text-muted-foreground">Route: Junction → Perumalpuram</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-xs font-bold">
                                        Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 rounded-lg bg-background/50">
                                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Current Task</p>
                                        <p className="text-sm font-medium">Monitoring Route</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-background/50">
                                        <p className="text-[10px] text-muted-foreground uppercase mb-1">Passengers</p>
                                        <p className="text-sm font-medium">24 / 45</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full mt-6 rounded-xl h-12 gap-2">
                                <MapPin className="w-4 h-4" />
                                Update Live Location
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DriverProfile;
