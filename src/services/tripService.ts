export interface Trip {
  id: string;
  driverId: string;
  busId: string;
  routeId: string;
  routeName: string;
  startTime: string;
  endTime?: string;
  distanceCovered: number;
  duration: number;
  status: 'active' | 'completed' | 'cancelled';
}

export const tripService = {
  async startTrip(busId: string, routeId: string, routeName?: string): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : null;

      const response = await fetch('/api/trips/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ busId, routeId, routeName })
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to start trip' };

      return { success: true, trip: data };
    } catch (err) {
      return { success: false, error: 'Network Error' };
    }
  },

  async endTrip(tripId: string, distanceCovered: number): Promise<{ success: boolean; trip?: Trip; error?: string }> {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : null;

      const response = await fetch(`/api/trips/${tripId}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ distanceCovered })
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to end trip' };

      // Update local storage user stats if needed, or wait for socket event
      return { success: true, trip: data };
    } catch (err) {
      return { success: false, error: 'Network Error' };
    }
  },

  async getMyTrips(): Promise<{ success: boolean; trips?: Trip[]; error?: string }> {
    try {
      const userStr = localStorage.getItem('user');
      const token = userStr ? JSON.parse(userStr).token : null;

      const response = await fetch('/api/trips', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.message || 'Failed to fetch trips' };

      return { success: true, trips: data };
    } catch (err) {
      return { success: false, error: 'Network Error' };
    }
  }
};
