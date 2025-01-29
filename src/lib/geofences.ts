import { GeofenceRadar, Geofence } from "@/types";

// Fetch geofences from the Radar API
export const fetchGeofencesRadar = async (): Promise<GeofenceRadar[] | undefined> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
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

// Fetch geofences from the database
export const fetchGeofences = async (): Promise<Geofence[] | undefined> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${import.meta.env.VITE_abu_V2}/admin/geofences`, {
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
    return data;
  } catch (error) {
    console.error("Error fetching geofences:", error);
  }
};