import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { User, UserCircle, Mail, Calendar, Settings, Phone, MapPin, Save, X } from "lucide-react";
import { authService } from "@/services/authService";
import type { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, type UserProfileFormData } from "@/lib/validations/auth";

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
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <div className="glass-card rounded-2xl p-8 h-96 skeleton" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="glass-card rounded-2xl p-8 shadow-xl animate-fade-in">
                    <form onSubmit={handleSubmit(onSave)}>
                        <div className="flex flex-col items-center mb-8 text-center">
                            <PhotoUpload
                                userId={user.id}
                                currentPhoto={user.profilePhoto}
                                onUploadSuccess={(url) => setUser({ ...user, profilePhoto: url })}
                            />
                            {isEditing ? (
                                <div className="mt-4 w-full max-w-sm">
                                    <input
                                        {...register("name")}
                                        type="text"
                                        className={`input-field text-center text-3xl font-bold bg-transparent border-b-2 border-primary/20 focus:border-primary px-2 ${errors.name ? 'border-red-500' : ''}`}
                                        placeholder="Enter Name"
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
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
                                        <>
                                            <input
                                                {...register("phone")}
                                                type="tel"
                                                className={`w-full bg-transparent border-none focus:ring-0 p-0 font-medium ${errors.phone ? 'text-red-500' : ''}`}
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                        </>
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
                                        <>
                                            <input
                                                {...register("city")}
                                                type="text"
                                                className={`w-full bg-transparent border-none focus:ring-0 p-0 font-medium ${errors.city ? 'text-red-500' : ''}`}
                                                placeholder="Enter city"
                                            />
                                            {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                                        </>
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
                                            type="submit"
                                            className="flex-1 rounded-xl gap-2 h-12"
                                            disabled={isSubmitting}
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSubmitting ? "Saving..." : "Save Changes"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 rounded-xl gap-2 h-12"
                                            onClick={handleCancel}
                                            disabled={isSubmitting}
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            type="button"
                                            className="flex-1 rounded-xl gap-2 h-12"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Edit Profile
                                        </Button>
                                        <Button
                                            type="button"
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
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfile;
