import supabase from "@/utils/supabase";

// Fungsi untuk memeriksa apakah 5 menit telah berlalu sejak operasi terakhir
const canWriteData = () => {
  const lastWritten = localStorage.getItem('lastWritten');
  const now = new Date().getTime();

  if (lastWritten && now - parseInt(lastWritten) < 300000) { // 300000 ms = 5 menit
    return false;
  }

  localStorage.setItem('lastWritten', now.toString());
  return true;
};

export const saveLocationToDatabase = async (userId: string, username: string, latitude: number, longitude: number) => {
  if (canWriteData()) {
    const { error } = await supabase
      .from("locations")
      .upsert({
        user_id: userId,
        username,
        latitude,
        longitude,
      });

    if (error) {
      console.error("Error updating location:", error.message);
    }
  } else {
    return []
  }
};

export const getLatestLocationForEachUser = async () => {
  try {
    // Menggunakan RPC untuk memanggil fungsi yang telah dibuat
    const { data, error } = await supabase
      .rpc('get_latest_user_locations');

    if (error) {
      console.error("Error fetching latest locations:", error.message);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
};
