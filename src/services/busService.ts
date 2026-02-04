import type { Bus, BusDetails, BusFilters } from "@/types";

const API_URL = '/api/buses';

// Simple cache to store bus data and timestamp
let busCache: { data: Bus[], timestamp: number } | null = null;
const CACHE_DURATION = 10000; // 10 seconds

export const busService = {
  // Get all buses
  async getAllBuses(forceRefresh = false, page = 1, limit = 100): Promise<Bus[]> {
    const now = Date.now();

    // Return cached data if available and not expired (simplified for pagination)
    if (!forceRefresh && busCache && (now - busCache.timestamp < CACHE_DURATION) && page === 1) {
      console.log('Returning cached bus data');
      return busCache.data;
    }

    try {
      console.log(`Fetching bus data (Page: ${page}, Limit: ${limit})...`);
      const startTime = performance.now();

      const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch buses');
      const data = await response.json();

      // Backend now returns { buses, total, page, pages }
      const busesList = Array.isArray(data) ? data : data.buses;

      const mappedData = busesList.map((bus: any) => ({
        ...bus,
        id: bus._id
      }));

      // Update cache ONLY for first page
      if (page === 1) {
        busCache = { data: mappedData, timestamp: now };
      }

      const endTime = performance.now();
      console.log(`Fetch completed in ${(endTime - startTime).toFixed(2)}ms`);

      return mappedData;
    } catch (error) {
      console.error("Error fetching buses:", error);
      if (busCache && page === 1) return busCache.data;
      return [];
    }
  },

  // Get bus by ID
  async getBusById(id: string): Promise<BusDetails | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        ...data,
        id: data._id
      };
    } catch (error) {
      console.error("Error fetching bus:", error);
      return null;
    }
  },

  // Filter buses
  async filterBuses(filters: BusFilters): Promise<Bus[]> {
    const buses = await this.getAllBuses();

    // Client-side filtering
    let filtered = [...buses];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bus) =>
          bus.name.toLowerCase().includes(query) ||
          bus.routeFrom.toLowerCase().includes(query) ||
          bus.routeTo.toLowerCase().includes(query)
      );
    }

    if (filters.route) {
      filtered = filtered.filter((bus) =>
        `${bus.routeFrom} - ${bus.routeTo}` === filters.route
      );
    }

    if (filters.status) {
      filtered = filtered.filter((bus) => bus.status === filters.status);
    }

    return filtered;
  },

  // Get available routes
  async getRoutes(): Promise<string[]> {
    const buses = await this.getAllBuses();
    const routes = new Set(buses.map(b => `${b.routeFrom} - ${b.routeTo}`));
    return Array.from(routes) as string[];
  },

  // Update bus location
  async updateBusLocation(busId: string, location: string, eta: string): Promise<boolean> {
    return true;
  },

  // Create Bus
  async createBus(busData: any): Promise<boolean> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData)
      });
      // Clear cache on new bus creation
      if (response.ok) busCache = null;
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Update Bus
  async updateBus(id: string, busData: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData)
      });
      // Clear cache on update
      if (response.ok) busCache = null;
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Delete Bus
  async deleteBus(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      // Clear cache on deletion
      if (response.ok) busCache = null;
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

export default busService;
