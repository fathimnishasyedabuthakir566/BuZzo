import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { User, UserCircle, Mail, Calendar, Settings, Phone, MapPin, Save, X } from "lucide-react";
import { authService } from "@/services/authService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";

const UserProfile = () => {
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
            if (!currentUser) {
                navigate("/auth");
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
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="glass-card rounded-2xl p-8 shadow-xl animate-fade-in">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <PhotoUpload
                            userId={user.id}
                            currentPhoto={user.profilePhoto}
                            onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                        />
                        {isEditing ? (
                            <div className="mt-4 w-full max-w-sm">
                                <input
                                    type="text"
                                    className="input-field text-center text-3xl font-bold bg-transparent border-b-2 border-primary/20 focus:border-primary px-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        ) : (
                            <h1 className="mt-4 text-3xl font-bold">{user.name}</h1>
                        )}
                        <p className="text-muted-foreground capitalize">{user.role} Account</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <Mail className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Email Address</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <Phone className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">City</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Enter city"
                                    />
                                ) : (
                                    <p className="font-medium">{user.city || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</p>
                                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        className="flex-1 rounded-xl gap-2 h-12"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl gap-2 h-12"
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
                                        className="flex-1 rounded-xl gap-2 h-12"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-12"
                                        onClick={() => {
                                            authService.logout();
                                            navigate("/auth");
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfile;
