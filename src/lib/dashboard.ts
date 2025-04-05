import supabase from "@/utils/supabase";

export async function getUsersCounts() {
  const excludedUserNames = ['[DevUser]', '[DevClient123]', '[Demo 1]',
    // 'Contoh Client'
  ]
  const { data, error } = await supabase
    .from("users")
    .select("username, role", { count: "exact" })
    .not("username", "in", `(${excludedUserNames})`);
  if (error) throw new Error(`Error fetching users counts: ${error.message}`);
  const userCount = data.filter((user) => user.role === "user").length;
  const clientCount = data.filter((user) => user.role === "client").length;
  return { userCount, clientCount };
}

// export async function getGeofencesCounts() {
//   const excludedGeofenceNames = ['Tes Lokasi'];
//   const excludedGeofenceTags = ['testing'];
//   const { data, error } = await supabase
//     .from("geofences")
//     .select("province, description", { count: "exact" })
//     .not("description", "in", `(${excludedGeofenceNames})`)
//     .not("tag", "in", `(${excludedGeofenceTags})`);

//   if (error) {
//     throw new Error(`Error fetching geofences counts: ${error.message}`);
//   }

//   const provinceCounts = data.reduce((acc, geofence) => {
//     if (geofence.province) {
//       acc[geofence.province] = (acc[geofence.province] || 0) + 1;
//     }
//     return acc;
//   }, {} as Record<string, number>);

//   const provinceData = Object.keys(provinceCounts).map((province) => ({
//     province,
//     count: provinceCounts[province],
//   }));
//   return provinceData;
// }
export async function getGeofencesCounts() {
  const excludedGeofenceNames = ['Tes Lokasi'];
  const excludedGeofenceTags = ['testing'];
  const { data, error } = await supabase
    .from("geofences")
    .select("city, description", { count: "exact" })
    .not("description", "in", `(${excludedGeofenceNames})`)
    .not("tag", "in", `(${excludedGeofenceTags})`);

  if (error) {
    throw new Error(`Error fetching geofences counts: ${error.message}`);
  }

  const cityCounts = data.reduce((acc, geofence) => {
    if (geofence.city) {
      acc[geofence.city] = (acc[geofence.city] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const cityData = Object.keys(cityCounts).map((city) => ({
    city,
    count: cityCounts[city],
  }));
  return cityData;
}

export async function getTicketsCounts(timeRange: string) {
  const excludedTicketsFromUser = ['5a494e85-4e02-42d7-81dd-1a88003cf6b1'];
  const startDate = new Date();
  const days = parseInt(timeRange.replace('d', ''));
  startDate.setDate(startDate.getDate() - days);
  const { data, error } = await supabase
    .from("tickets")
    .select("ticket_id, status, updated_at")
    .not("user_id", "in", `(${excludedTicketsFromUser})`)
    .gte("updated_at", startDate.toISOString());
  if (error) throw new Error(`Error fetching ticket counts: ${error.message}`);
  return data;
}

export async function getTripsCounts(timeRange: string) {
  const excludedUserTrips = ['5a494e85-4e02-42d7-81dd-1a88003cf6b1'];
  const excludedGeofenceTrips = ['LK2'];
  const startDate = new Date();
  const days = parseInt(timeRange.replace('d', ''));
  startDate.setDate(startDate.getDate() - days);
  const { data, error } = await supabase
    .from("trips")
    .select("external_id, status, updated_at")
    .not("user_id", "in", `(${excludedUserTrips})`)
    .not("geofence_id", "in", `(${excludedGeofenceTrips})`)
    .gte("updated_at", startDate.toISOString());
  if (error) throw new Error(`Error fetching trip counts: ${error.message}`);
  const modifiedData = data.map(trip => ({
    ...trip,
    status: trip.status === 'started' ? 'on_progress' : trip.status
  }));
  return modifiedData;
}

export async function getRecentTickets() {
  const excludedTicketsFromUser = ['5a494e85-4e02-42d7-81dd-1a88003cf6b1'];
  const excludedGeofenceNames = ['Tes Lokasi'];
  const excludedGeofenceTags = ['testing'];
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      ticket_id,
      trip_id,
      description,
      status,
      updated_at,
      users:user_id (username),
      geofences:geofence_id (description)
    `)
    .order('updated_at', { ascending: false })
    .not("user_id", "in", `(${excludedTicketsFromUser})`)
    .not("geofences.description", "in", `(${excludedGeofenceNames})`)
    .not("geofences.tag", "in", `(${excludedGeofenceTags})`)
    .limit(10);
  if (error) throw error;
  return data;
}
