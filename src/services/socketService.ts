import { io, Socket } from 'socket.io-client';
import { toast } from "sonner";

const URL = 'http://localhost:5001'; // Backend URL

class SocketService {
    public socket: Socket | null = null;
    private offlineQueue: { routeId: string; lat: number; lng: number; timestamp: number }[] = [];

    constructor() {
        // Listen for online/offline events
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    connect() {
        if (!this.socket) {
            this.socket = io(URL);
            this.socket.on('connect', () => {
                console.log('Connected to socket server');
                this.processOfflineQueue(); // Sync any pending data
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoute(routeId: string) {
        if (this.socket) {
            this.socket.emit('join-route', routeId);
        }
    }

    startTrip(routeId: string) {
        if (this.socket) {
            this.socket.emit('start-trip', routeId);
        }
    }

    stopTrip(routeId: string) {
        if (this.socket) {
            this.socket.emit('stop-trip', routeId);
        }
    }

    sendLocation(routeId: string, lat: number, lng: number) {
        if (navigator.onLine && this.socket?.connected) {
            this.socket.emit('update-location', { routeId, lat, lng });
        } else {
            // Offline mode: Queue the update
            console.log('Offline: Queuing location update');
            this.offlineQueue.push({ routeId, lat, lng, timestamp: Date.now() });
            toast.warning("You are offline. Location saved locally.");
        }
    }

    subscribeToLocation(callback: (data: any) => void) {
        if (!this.socket) return;
        this.socket.on('receive-location', callback);
    }

    unsubscribeFromLocation() {
        if (!this.socket) return;
        this.socket.off('receive-location');
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) this.connect();
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }

    emit(event: string, data: any) {
        if (!this.socket) this.connect();
        this.socket?.emit(event, data);
    }

    private handleOnline() {
        console.log('Network restored. Processing queue...');
        toast.success("Back online! Syncing data...");
        this.connect(); // Reconnect if needed
        this.processOfflineQueue();
    }

    private handleOffline() {
        console.log('Network lost.');
        toast.warning("Connection lost. Switching to offline mode.");
    }

    private processOfflineQueue() {
        if (this.offlineQueue.length > 0 && this.socket?.connected) {
            console.log(`Syncing ${this.offlineQueue.length} offline locations...`);

            this.offlineQueue.forEach((item) => {
                // Optionally send timestamp so backend knows when it actually happened
                this.socket?.emit('update-location', {
                    routeId: item.routeId,
                    lat: item.lat,
                    lng: item.lng,
                    offlineTimestamp: item.timestamp
                });
            });

            this.offlineQueue = [];
            toast.success("Offline data synced successfully!");
        }
    }
}

export const socketService = new SocketService();
