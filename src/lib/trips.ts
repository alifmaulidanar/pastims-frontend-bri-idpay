/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Geofence, UserRadar } from '@/types';

const BASE_URL = import.meta.env.VITE_abu_V2;
const SLSS = import.meta.env.VITE_slss;

// Fetch tickets from the backend API
export const fetchDBTrips = async ({ queryKey }: { queryKey: [string, number, number] }) => {
  try {
    const token = localStorage.getItem(`${SLSS}`);
    const [, limit, page] = queryKey;
    const response = await fetch(`${BASE_URL}/admin/trips?limit=${limit}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch tickets data:", errorData.message);
      throw new Error(errorData.message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tickets data:", error);
    throw error;
  }
};

export const fetchTripInfo = async (trip_id: string): Promise<any> => {
  try {
    const token = localStorage.getItem(`${SLSS}`);
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