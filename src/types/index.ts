// ==========================================
// BUS TYPES
// ==========================================

export type BusStatus = "active" | "inactive" | "on-route" | "delayed" | "on-time" | "arriving" | "departed" | "unavailable" | "completed" | "not-started";

export interface BusTiming {
  time: string;
  status: "departed" | "current" | "upcoming";
  location: string;
  eta?: string;
}

export interface Bus {
  _id?: string;
  id: string;
  name: string;
  routeFrom: string;
  routeTo: string;
  scheduledTime: string | string[]; // Can be single string or array of strings
  platformNumber?: number;
  intermediateStops?: {
    name: string;
    lat: number;
    lng: number;
    order: number;
  }[];
  currentStop?: string;
  nextStop?: string;
  status: BusStatus;
  eta?: string;
  currentLocation?: string;
  lastUpdate?: string;
  driverName?: string;
  driverPhone: string;
  busNumber: string;
  conductorName?: string;
  conductorPhone?: string;
  capacity: number;
  ac: boolean;
  isActive: boolean;
  speed?: number;
  availableSeats?: number;
  driverRating?: number;
  driverStatus?: "Driving" | "Break" | "Trip Completed";
  busType?: "Town Bus" | "Mofussil" | "Express" | "Deluxe" | "AC" | "Ultra Deluxe" | "SFS";
  serviceType?: "Ordinary" | "Express" | "Special" | "1to1" | "EAC" | "BPR";
  depot?: string;
  via?: string[];
  route?: string;
  location?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export interface BusDetails extends Bus {
  driverName: string;
  driverPhone: string;
  timings: BusTiming[];
}

// ==========================================
// USER TYPES
// ==========================================

export type UserRole = "user" | "admin" | "driver";

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  profilePhoto?: string;
  assignedBus?: string;
  isBlocked?: boolean;
  createdAt: string;

  // New RBAC Fields
  licenseNumber?: string;
  assignedRoute?: string;
  totalTrips?: number;
  totalDistance?: number;
  drivingHours?: number;
  lastTripTime?: string;
  emergencyContact?: string;
  availabilityStatus?: 'Available' | 'On Trip' | 'Offline';
  
  favoriteRoutes?: string[];
  department?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==========================================
// ROUTE TYPES
// ==========================================

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  distance?: string;
  estimatedTime?: string;
}

// ==========================================
// FILTER TYPES
// ==========================================

export interface BusFilters {
  route: string;
  status: string;
  searchQuery: string;
  platform?: number | 'all';
}
