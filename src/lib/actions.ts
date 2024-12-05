import supabase from "@/utils/supabase";

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

// export const saveLocationToDatabase = async (userId: string, username: string, latitude: number, longitude: number) => {
//   if (canWriteData()) {
//     const response = await fetch('http://127.0.0.1:8787/save-location', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         user_id: userId,
//         username,
//         latitude,
//         longitude,
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log('Location saved:', data);
//     } else {
//       console.error('Error saving location:', data.message);
//     }
//   } else {
//     console.log('Too soon to save location. Please wait 5 minutes.');
//   }
// };

export const getLatestLocationForEachUser = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8787/latest-locations');
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
