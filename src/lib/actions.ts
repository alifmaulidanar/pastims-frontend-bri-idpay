import supabase from "@/utils/supabase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const canWriteData = () => {
  const lastWritten = localStorage.getItem('lastWritten');
  const now = new Date().getTime();

  if (lastWritten && now - parseInt(lastWritten) < 3000000) { // 300000 ms = 5 menit
    return false;
  }

  localStorage.setItem('lastWritten', now.toString());
  return true;
};

export const saveLocationToDatabase = async (user_id: string, latitude: number, longitude: number) => {
  if (canWriteData()) {
    const response = await fetch(`${BASE_URL}/save-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        latitude,
        longitude,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Location saved:', data);
    } else {
      console.error('Error saving location:', data.message);
    }
  } else {
    console.log('Too soon to save location. Please wait 5 minutes.');
  }
};

export const getLatestLocationForEachUser = async () => {
  try {
    const response = await fetch(`${BASE_URL}/latest-locations`);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error("Error fetching latest locations:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
};

export async function getLastGeofenceIndex() {
  try {
    // Query ke Supabase untuk mendapatkan baris terakhir berdasarkan external_id
    const { data, error } = await supabase
      .from('geofences') // Tabel geofences
      .select('external_id')
      .order('external_id', { ascending: false }) // Urutkan descending
      .limit(1); // Ambil 1 baris terakhir

    if (error) {
      console.error('Error fetching last geofence:', error);
      return null;
    }

    if (data && data.length > 0) {
      // Extract angka dari external_id, misalnya "LK123" -> 123
      const lastId = data[0].external_id;
      const match = lastId.match(/\d+$/); // Cari angka di akhir
      return match ? parseInt(match[0], 10) : null; // Parse angka terakhir
    }

    return null; // Tidak ada data
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}