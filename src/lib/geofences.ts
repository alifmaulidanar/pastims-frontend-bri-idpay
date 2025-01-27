import { GeofenceRadar, Geofence } from "@/types";

export const fetchGeofencesRadar = async (): Promise<GeofenceRadar[] | undefined> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/geofence/radar/geofences`, {
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

export const fetchGeofences = async (): Promise<Geofence[] | undefined> => {
  try {
    const token = localStorage.getItem("sb-dobdbdahljvbkymkssgm-auth-token");
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/geofence/geofences`, {
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