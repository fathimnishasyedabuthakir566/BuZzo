// ==========================================
// BUS TYPES
// ==========================================

export type BusStatus = "on-time" | "delayed" | "arriving" | "departed" | "unavailable" | "completed" | "not-started";

export interface BusTiming {
  time: string;
  status: "departed" | "current" | "upcoming";
  location: string;
}

export interface Bus {
  id: string;
  name: string;
  routeFrom: string;
  routeTo: string;
  scheduledTime: string;
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
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  city?: string;
  profilePhoto?: string;
  assignedBus?: string;
  createdAt: string;
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
}
