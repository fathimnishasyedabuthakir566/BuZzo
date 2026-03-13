import type { Bus, BusDetails, BusFilters } from "@/types";

const API_URL = '/api/buses';

// --- MOCK DATA FOR FALLBACK ---
const nagercoilStops = [
  { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
  { name: "Nanguneri", lat: 8.4904, lng: 77.6534, order: 2 },
  { name: "Valliyur", lat: 8.3846, lng: 77.6167, order: 3 },
  { name: "Panagudi", lat: 8.3245, lng: 77.5812, order: 4 },
  { name: "Nagercoil BS", lat: 8.1833, lng: 77.4119, order: 5 }
];

const tiruchendurStops = [
  { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
  { name: "Srivaikuntam", lat: 8.6315, lng: 77.9100, order: 2 },
  { name: "Alwarthirunagari", lat: 8.6012, lng: 77.9400, order: 3 },
  { name: "Nazareth", lat: 8.5600, lng: 77.9700, order: 4 },
  { name: "Tiruchendur BS", lat: 8.4842, lng: 78.1250, order: 5 }
];

const tenkasiStops = [
  { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
  { name: "Alangulam", lat: 8.8741, lng: 77.5025, order: 2 },
  { name: "Tenkasi", lat: 8.9594, lng: 77.3037, order: 3 }
];

const maduraiStops = [
  { name: "Tirunelveli BS", lat: 8.7139, lng: 77.7567, order: 1 },
  { name: "Kovilpatti", lat: 9.1700, lng: 77.8700, order: 2 },
  { name: "Sattur", lat: 9.3500, lng: 77.9300, order: 3 },
  { name: "Virudhunagar", lat: 9.5800, lng: 77.9500, order: 4 },
  { name: "Madurai BS", lat: 9.9252, lng: 78.1198, order: 5 }
];

const createMockBus = (id: string, name: string, number: string, from: string, to: string, times: string[], platform: number, type: Bus['busType'], service: Bus['serviceType'], depot: string, via: string[], stops: Bus['intermediateStops'] = [], ac = false): Bus => {
  const nextStop = via && via.length > 0 ? via[0] : (stops.length > 1 ? stops[1].name : to);
  return {
    id,
    name,
    busNumber: number,
    routeFrom: from,
    routeTo: to,
    scheduledTime: times,
    platformNumber: platform,
    busType: type,
    serviceType: service,
    depot: depot,
    via: via || [],
    intermediateStops: stops,
    driverName: "City Driver",
    driverPhone: "9876543210",
    driverRating: 4.5,
    driverStatus: "Driving",
    conductorName: "Staff",
    conductorPhone: "9876543211",
    capacity: 45,
    availableSeats: Math.floor(Math.random() * 30) + 5,
    speed: Math.floor(Math.random() * 20) + 30,
    ac,
    status: 'on-time',
    isActive: Math.random() > 0.3,
    nextStop
  };
};

const MOCK_BUSES: Bus[] = [
  createMockBus("1", "Nagercoil End-to-End", "TN 72 N 1801", "Tirunelveli", "Nagercoil", ["05:40", "06:00", "06:20", "06:40", "07:00", "07:20"], 1, "Mofussil", "1to1", "Ranithottam", ["Nanguneri", "Valliyur", "Panagudi"], nagercoilStops),
  createMockBus("2", "Nagercoil AC", "TN 72 N 2205", "Tirunelveli", "Nagercoil", ["09:00", "11:00", "13:00", "15:00"], 1, "AC", "EAC", "Ranithottam", ["Nanguneri", "Valliyur"], nagercoilStops, true),
  createMockBus("3", "Kanyakumari Deluxe", "TN 72 N 1555", "Tirunelveli", "Kanyakumari", ["06:00", "08:30", "10:30", "12:30"], 1, "Deluxe", "Express", "Kanyakumari", ["Nagercoil", "Suchindram"], nagercoilStops),
  createMockBus("4", "Tiruchendur BPR", "TN 72 N 1680", "Tirunelveli", "Tiruchendur", ["05:30", "06:30", "07:30", "08:30"], 2, "Mofussil", "BPR", "Tiruchendur", ["Srivaikuntam", "Alwarthirunagari"], tiruchendurStops),
  createMockBus("5", "Udangudi via Nazareth", "TN 72 N 1345", "Tirunelveli", "Udangudi", ["07:00", "12:00", "17:00"], 2, "Town Bus", "Ordinary", "Tiruchendur", ["Nazareth", "Sathankulam"], tiruchendurStops),
  createMockBus("6", "Tuticorin End-to-End", "TN 72 N 1950", "Tirunelveli", "Thoothukudi", ["05:00", "05:15", "05:30", "05:45"], 3, "Mofussil", "1to1", "Thoothukudi City", ["Vasavappapuram"], []),
  createMockBus("7", "Rameswaram Express", "TN 72 N 2100", "Tirunelveli", "Rameshwaram", ["06:00", "13:00", "20:00"], 3, "Express", "Express", "Rameshwaram", ["Thoothukudi", "Sayalkudi"], []),
  createMockBus("8", "Tenkasi P2P", "TN 72 N 1400", "Tirunelveli", "Tenkasi", ["05:10", "05:40", "06:10", "06:40"], 4, "Mofussil", "1to1", "Tenkasi", ["Alangulam"], tenkasiStops),
  createMockBus("9", "Papanasam Town", "TN 72 N 1290", "Tirunelveli", "Papanasam", ["06:30", "09:30", "12:30", "15:30"], 4, "Town Bus", "Ordinary", "Ambasamudram", ["Cheranmahadevi", "Ambasamudram"], []),
  createMockBus("10", "Coutrallam Special", "TN 72 N 1450", "Tirunelveli", "Coutrallam", ["08:00", "10:00", "14:00"], 4, "Deluxe", "Special", "Tenkasi", ["Alangulam", "Tenkasi"], tenkasiStops),
  createMockBus("11", "Madurai BPR", "TN 72 N 2005", "Tirunelveli", "Madurai", ["05:00", "06:00", "07:00", "08:00"], 5, "Mofussil", "BPR", "Bypass", ["Virudhunagar"], maduraiStops),
  createMockBus("12", "Coimbatore Ultra Deluxe", "TN 72 N 2500", "Tirunelveli", "Coimbatore", ["20:00", "21:00", "22:00"], 5, "Ultra Deluxe", "Express", "Tirenelveli", ["Madurai", "Dindigul", "Palani"], maduraiStops),
  createMockBus("13", "Chennai AC Sleeper", "TN 01 N 1001", "Tirunelveli", "Chennai", ["18:00", "19:00", "20:00"], 6, "AC", "Express", "Chennai - Koyambedu", ["Madurai", "Trichy"], maduraiStops, true),
  createMockBus("14", "Chennai Ultra Deluxe", "TN 01 N 1050", "Tirunelveli", "Chennai", ["14:00", "16:00", "17:30", "21:30"], 6, "Ultra Deluxe", "Express", "Chennai - Koyambedu", ["Madurai", "Trichy"], maduraiStops)
];

// Set diverse statuses for mock data
MOCK_BUSES[0].status = 'active';
MOCK_BUSES[1].status = 'on-route';
MOCK_BUSES[2].status = 'delayed';
MOCK_BUSES[3].status = 'inactive';
MOCK_BUSES[4].status = 'active';
MOCK_BUSES[5].status = 'on-route';
MOCK_BUSES[6].status = 'delayed';
MOCK_BUSES[7].status = 'active';
MOCK_BUSES[8].status = 'on-route';
MOCK_BUSES[9].status = 'active';
MOCK_BUSES[10].status = 'delayed';
MOCK_BUSES[11].status = 'active';
MOCK_BUSES[12].status = 'active';
MOCK_BUSES[13].status = 'active';

// Simple cache to store bus data and timestamp
let busCache: { data: Bus[], timestamp: number } | null = null;
const CACHE_DURATION = 10000; // 10 seconds

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const busService = {
  // Get all buses
  async getAllBuses(forceRefresh = false, page = 1, limit = 100): Promise<Bus[]> {
    const now = Date.now();

    // Return cached data if available and not expired (simplified for pagination)
    if (!forceRefresh && busCache && (now - busCache.timestamp < CACHE_DURATION) && page === 1) {
      console.log('Returning cached bus data');
      return busCache.data;
    }

    // Try session storage as a secondary cache for faster page loads
    if (!forceRefresh && page === 1) {
      const stored = sessionStorage.getItem('bus_data_cache');
      if (stored) {
        try {
          const { data, timestamp } = JSON.parse(stored);
          if (now - timestamp < CACHE_DURATION * 6) { // Cache session data longer (1 min)
            console.log('Returning session cached data');
            return data;
          }
        } catch (e) {
          sessionStorage.removeItem('bus_data_cache');
        }
      }
    }

    try {
      console.log(`Fetching bus data (Page: ${page}, Limit: ${limit})...`);
      const startTime = performance.now();

      const response = await fetchWithTimeout(`${API_URL}?page=${page}&limit=${limit}`, {}, 3000);

      if (!response.ok) throw new Error('Failed to fetch buses');
      const data = await response.json();

      // Backend now returns { buses, total, page, pages }
      const busesList = Array.isArray(data) ? data : (data?.buses || []);

      const mappedData = (busesList as Bus[]).map((bus) => ({
        ...bus,
        id: bus._id ? String(bus._id) : (bus.id || "")
      }));

      // Update cache ONLY for first page
      if (page === 1) {
        busCache = { data: mappedData, timestamp: now };
        sessionStorage.setItem('bus_data_cache', JSON.stringify(busCache));
      }

      const endTime = performance.now();
      console.log(`Fetch completed in ${(endTime - startTime).toFixed(2)}ms`);

      if (mappedData.length === 0) throw new Error("No data from API, using mock");

      return mappedData;
    } catch (error) {
      console.warn("API fetch failed or timed out, using fallback mock data:", error);
      // Fallback to MOCK DATA
      if (page === 1) {
        busCache = { data: MOCK_BUSES, timestamp: now };
        return MOCK_BUSES;
      }
      return [];
    }
  },

  // Get bus by ID
  async getBusById(id: string): Promise<BusDetails | null> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/${id}`);
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      return {
        ...data,
        id: data._id
      };
    } catch (error) {
      console.warn("API fetch failed, finding in mock data", error);
      const mockBus = MOCK_BUSES.find(b => b.id === id);
      if (mockBus) {
        const timings = (mockBus.intermediateStops || []).map(s => ({
          location: s.name,
          time: mockBus.scheduledTime[0] || "--:--",
          status: 'upcoming' as const
        }));

        return {
          ...mockBus,
          driverName: mockBus.driverName || "Unknown",
          driverPhone: mockBus.driverPhone || "",
          timings: timings.length > 0 ? timings : [
            { location: mockBus.routeFrom, time: mockBus.scheduledTime[0] || "--:--", status: 'departed' as const },
            { location: mockBus.routeTo, time: mockBus.scheduledTime[0] || "--:--", status: 'upcoming' as const }
          ]
        };
      }
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
          bus.routeTo.toLowerCase().includes(query) ||
          bus.busNumber.toLowerCase().includes(query)
      );
    }

    if (filters.route && filters.route !== 'all') {
      filtered = filtered.filter((bus) =>
        `${bus.routeFrom} - ${bus.routeTo}` === filters.route
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((bus) => bus.status === filters.status);
    }

    return filtered;
  },

  // Get available routes
  async getRoutes(): Promise<string[]> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/routes`);
      if (!response.ok) throw new Error('Failed to fetch routes');
      const data = await response.json();
      const routes = Array.isArray(data) ? data : (data?.routes || []);

      // If API returns no routes, fallback to mock data
      if (routes.length === 0) {
        const mockRoutes = new Set(MOCK_BUSES.map(b => `${b.routeFrom} - ${b.routeTo}`));
        return Array.from(mockRoutes);
      }
      return routes;
    } catch (error) {
      console.error("Error fetching routes:", error);
      // Mock routes from mock buses
      const routes = new Set(MOCK_BUSES.map(b => `${b.routeFrom} - ${b.routeTo}`));
      return Array.from(routes);
    }
  },

  // Update bus location
  async updateBusLocation(busId: string, location: string, eta: string): Promise<boolean> {
    console.log(busId, location, eta); // Placeholder usage
    return true;
  },

  // Create Bus
  async createBus(busData: Omit<Bus, 'id' | 'location'> & Partial<Bus>): Promise<boolean> {
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
  async updateBus(id: string, busData: Partial<Bus>): Promise<boolean> {
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
