/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geofence, UserRadar } from '@/types';

const BASE_URL = import.meta.env.VITE_abu_V2;

// Fetch tickets from the backend API
export const fetchTrips = async (): Promise<{
  users: UserRadar[];
  geofences: Geofence[];
  trips: any[];
}> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/admin/trips`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch tickets data:", errorData.message);
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tickets data:", error);
    throw error;
  }
};

export const fetchTripInfo = async (trip_id: string): Promise<any> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${BASE_URL}/admin/trips/trip/${trip_id}`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch trip data:", errorData.message);
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching trip data:", error);
    throw error;
  }
};