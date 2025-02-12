import { GeofenceRadar } from "@/types";
const SLSS = import.meta.env.VITE_slss;

// Fetch geofences from the Radar API
export const fetchGeofencesRadar = async (): Promise<GeofenceRadar[] | undefined> => {
  try {
    const token = localStorage.getItem(`${SLSS}`);
    const response = await fetch(`${import.meta.env.VITE_abu_V2}/admin/geofences/radar/geofences`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch geofences:", errorData.message);
      return;
    }
    const data = await response.json();
    return data.geofences;
  } catch (error) {
    console.error("Error fetching geofences:", error);
  }
};

// Fetch geofences from the database with pagination
export const fetchGeofences = async ({ queryKey }: { queryKey: [string, number, number] }) => {
  try {
    const token = localStorage.getItem(`${SLSS}`);
    const [, limit, page] = queryKey;
    const response = await fetch(`${import.meta.env.VITE_abu_V2}/admin/geofences?limit=${limit}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to fetch geofences:", errorData.message);
      return { geofences: [], count: 0 };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching geofences:", error);
    return { geofences: [], count: 0 };
  }
};
