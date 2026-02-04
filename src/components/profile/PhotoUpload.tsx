import { useState, useRef } from "react";
import { Camera, Upload, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { toast } from "sonner";

interface PhotoUploadProps {
    currentPhoto?: string;
    userId: string;
    onUploadSuccess: (newPhotoUrl: string) => void;
}

export const PhotoUpload = ({ currentPhoto, userId, onUploadSuccess }: PhotoUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG files are allowed.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB.");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile || !userId) return;

        setIsUploading(true);
        try {
            const response = await authService.uploadProfileImage(userId, selectedFile);
            if (response.success && response.user?.profilePhoto) {
                toast.success("Profile photo updated successfully!");
                onUploadSuccess(response.user.profilePhoto);
                setPreview(null);
                setSelectedFile(null);
            } else {
                toast.error(response.error || "Failed to upload image.");
            }
        } catch (error) {
            toast.error("An error occurred during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const cancelSelection = () => {
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Helper to get image source
    const getImageSrc = () => {
        if (preview) return preview;
        if (currentPhoto) {
            if (currentPhoto.startsWith('http') || currentPhoto.startsWith('data:')) {
                return currentPhoto;
            }
            return currentPhoto; // Backend handles /uploads prefix
        }
        return null;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-secondary flex items-center justify-center shadow-lg">
                    {getImageSrc() ? (
                        <img
                            src={getImageSrc()!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                // Show placeholder instead
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent && !parent.querySelector('.fallback-icon')) {
                                    const icon = document.createElement('div');
                                    icon.className = 'fallback-icon flex items-center justify-center w-full h-full';
                                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';
                                    parent.appendChild(icon);
                                }
                            }}
                        />
                    ) : (
                        <Camera className="w-12 h-12 text-muted-foreground" />
                    )}
                </div>

                {!preview && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90 transition-all scale-90 group-hover:scale-100"
                        title="Change Photo"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
            />

            {preview && (
                <div className="flex items-center gap-2 animate-fade-in">
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 h-9 px-4 rounded-xl"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirm
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-9 px-4 rounded-xl"
                        onClick={cancelSelection}
                        disabled={isUploading}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                </div>
            )}

            {!preview && !isUploading && (
                <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                </p>
            )}
        </div>
    );
};
