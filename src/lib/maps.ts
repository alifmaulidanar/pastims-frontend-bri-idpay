import { GeofenceRadar, Ticket, UserRadar } from "@/types";

const BASE_URL = import.meta.env.VITE_abu_V2;
const SLSS = import.meta.env.VITE_slss;

export const fetchMaps = async (): Promise<{
  users: UserRadar[];
  geofences: GeofenceRadar[];
  tickets: Ticket[];
}> => {
  try {
    const token = localStorage.getItem(`${SLSS}`);
    const response = await fetch(`${BASE_URL}/admin/maps`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch maps data:", errorData.message);
      throw new Error(errorData.message);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching maps data:", error);
    throw error;
  }
};
