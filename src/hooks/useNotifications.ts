import { useEffect, useState } from "react";
import { socketService } from "@/services/socketService";
import { calculateDistance } from "@/utils/routeUtils";
import { toast } from "sonner";

interface UseNotificationsProps {
    routeId?: string;
    selectedStop?: {
        name: string;
        lat: number;
        lng: number;
    } | null;
    radiusKm?: number; // Distance at which to trigger notification
}

export const useNotifications = ({
    routeId,
    selectedStop,
    radiusKm = 1.0
}: UseNotificationsProps) => {
    const [hasNotified, setHasNotified] = useState(false);

    useEffect(() => {
        if (!routeId || !selectedStop) {
            setHasNotified(false);
            return;
        }

        socketService.subscribeToLocation((data) => {
            if (data.routeId !== routeId || hasNotified) return;

            if (data.lat && data.lng) {
                const distance = calculateDistance(
                    data.lat,
                    data.lng,
                    selectedStop.lat,
                    selectedStop.lng
                );

                if (distance <= radiusKm) {
                    toast.success(`Bus is approaching!`, {
                        description: `The bus is less than ${radiusKm}km away from ${selectedStop.name}.`,
                        duration: 5000,
                    });
                    setHasNotified(true);

                    // Native vibration if available
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]);
                    }
                }
            }
        });

        return () => {
            // Note: We don't unsubscribe globally here because BusDetails might be using it
            // But we can reset notification status if stop changes
        };
    }, [routeId, selectedStop, radiusKm, hasNotified]);

    const resetNotification = () => setHasNotified(false);

    return { hasNotified, resetNotification };
};
