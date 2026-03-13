import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { User, Mail, Calendar, Settings, Phone, MapPin, Save, X, Shield, Bell, Key, LogOut, ChevronRight, Activity, Bus, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

const UserProfile = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserProfileFormData>({
        resolver: zodResolver(userProfileSchema),
    });

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser();
            if (!currentUser) {
                navigate("/auth");
                return;
            }
            setUser(currentUser);
            reset({
                name: currentUser.name,
                phone: currentUser.phone || "",
                city: currentUser.city || ""
            });
        };
        fetchUser();

        window.addEventListener('user-updated', fetchUser);
        return () => window.removeEventListener('user-updated', fetchUser);
    }, [navigate, reset]);

    const onSave = async (data: UserProfileFormData) => {
        if (!user) return;

        try {
            const response = await authService.updateUserProfile({
                id: user.id,
                ...data
            });

            if (response.success) {
                toast.success("Profile updated successfully");
                setIsEditing(false);
            } else {
                toast.error(response.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            reset({
                name: user.name,
                phone: user.phone || "",
                city: user.city || ""
            });
        }
    };

    if (!user) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8 max-w-md">
                    <div className="rounded-3xl p-8 h-[600px] skeleton w-full" />
                </div>
            </Layout>
        );
    }

    // Passenger specific stats
    const passengerStats = [
        { icon: Activity, label: "Trips Taken", value: user.totalTrips || 0 },
        { icon: MapPin, label: "Favorite Routes", value: user.favoriteRoutes?.length || 0 },
        { icon: Bus, label: "Distance (km)", value: user.totalDistance?.toFixed(1) || "0.0" },
    ];

    return (
        <Layout>
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
                {/* --- Top Section: Gradient Header --- */}
                <div className="relative pt-12 pb-24 px-6 rounded-b-[40px] shadow-lg overflow-hidden flex flex-col items-center">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-buzzo opacity-90"></div>
                    {/* Decorative pattern/blur overlay */}
                    <div className="absolute top-0 w-full h-full bg-slate-900/10 backdrop-blur-[2px]"></div>

                    <form onSubmit={handleSubmit(onSave)} className="relative z-10 w-full flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative mb-4">
                            <div className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-xl">
                                <PhotoUpload
                                    userId={user.id}
                                    currentPhoto={user.profilePhoto}
                                    onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                                />
                            </div>
                        </div>

                        {/* Name & Role Badge */}
                        <div className="text-center w-full">
                            {isEditing ? (
                                <div className="mb-2">
                                    <input
                                        {...register("name")}
                                        type="text"
                                        className={cn(
                                            "w-full text-center text-3xl font-bold bg-white/20 text-white rounded-xl border-2 border-white/30 focus:border-white focus:outline-none px-4 py-2 transition-all placeholder:text-white/50",
                                            errors.name && "border-red-400 bg-red-400/20"
                                        )}
                                        placeholder="Enter Full Name"
                                    />
                                    {errors.name && <p className="text-xs text-red-200 mt-1">{errors.name.message}</p>}
                                </div>
                            ) : (
                                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                            )}
                            
                            {/* Role Badge */}
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium tracking-wide shadow-sm">
                                <span className="mr-1.5 w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                Passenger Account
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- Middle Section: Stats & Info --- */}
                <div className="px-6 -mt-12 relative z-20 space-y-6">
                    
                    {/* Stats Row */}
                    <div className="flex gap-4 justify-between bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-700">
                        {passengerStats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1">
                                <div className="p-2.5 bg-primary/10 rounded-2xl mb-2 text-primary">
                                    <stat.icon size={20} className="opacity-80" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5 text-center">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <form id="profile-details-form" onSubmit={handleSubmit(onSave)}>
                        {/* Information List List */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-soft border border-gray-100 dark:border-gray-700 space-y-5">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Profile Details</h3>

                            {/* Email Item */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Email Address</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                                </div>
                            </div>

                            {/* Phone Item */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Phone Number</p>
                                    {isEditing ? (
                                        <>
                                            <input
                                                {...register("phone")}
                                                type="tel"
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400/50"
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                                        </>
                                    ) : (
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.phone || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            {/* City Item */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">City</p>
                                    {isEditing ? (
                                        <>
                                            <input
                                                {...register("city")}
                                                type="text"
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 font-semibold text-gray-900 dark:text-gray-100 placeholder:text-gray-400/50"
                                                placeholder="Enter city"
                                            />
                                            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                                        </>
                                    ) : (
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{user.city || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Member Since Item */}
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex-1 pb-2">
                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Member Since</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* --- Bottom Section: Edit Actions (If editing) --- */}
                        {isEditing && (
                            <div className="flex gap-4 mt-6 animate-fade-in">
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-2xl gap-2 h-14 gradient-btn-buzzo font-bold shadow-soft"
                                    disabled={isSubmitting}
                                >
                                    <Save className="w-5 h-5" />
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-2xl gap-2 h-14 font-semibold border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-200 transition-all"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    <X className="w-5 h-5" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </form>

                    {/* --- Bottom Section: Settings & Actions (If NOT editing) --- */}
                    {!isEditing && (
                        <>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-3 shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in">
                                <OptionRow icon={Key} label="Change Password" />
                                <OptionRow icon={Bell} label="Notifications" badge="2" />
                                <OptionRow icon={Shield} label="Privacy & Security" border={false} />
                            </div>

                            <div className="flex flex-col gap-3 mt-8">
                                <Button
                                    type="button"
                                    className="w-full rounded-2xl gap-2 h-14 gradient-btn-buzzo font-bold shadow-soft text-lg tracking-wide hover:shadow-lg transition-all"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Settings className="w-5 h-5" />
                                    Edit Profile
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full rounded-2xl h-14 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                    onClick={() => {
                                        authService.logout();
                                        navigate("/auth");
                                    }}
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

import { type LucideIcon } from "lucide-react";

// Helper component for settings rows
const OptionRow = ({ icon: Icon, label, badge, border = true }: { icon: LucideIcon | React.ElementType, label: string, badge?: string, border?: boolean }) => (
    <button type="button" className={cn("w-full flex items-center justify-between p-4 group hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-2xl transition-all", border && "border-b border-gray-50 dark:border-gray-800")}>
        <div className="flex items-center gap-4 text-left">
            <div className="p-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-gray-500 group-hover:text-primary transition-colors">
                <Icon size={18} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold leading-tight">
                    {badge}
                </span>
            )}
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
        </div>
    </button>
);

export default UserProfile;
