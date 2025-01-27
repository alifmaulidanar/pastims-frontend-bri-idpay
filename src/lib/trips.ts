/* eslint-disable @typescript-eslint/no-explicit-any */
export const fetchTrips = async (setTrips: any) => {
  try {
    const token = localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_SESSION);
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/trip/radar/trips`, {
      headers: {
        Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch geofences");
      return;
    }
    const data = await response.json();
    setTrips(data.trips || []);
  } catch (error) {
    console.error("Failed to fetch geofences:", error);
  }
};