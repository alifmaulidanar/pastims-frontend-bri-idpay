/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRadar as User } from "@/types";

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("https://api.radar.io/v1/trips", {
          headers: {
            Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
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
    fetchTrips();
  }, []);

  // Fetch geofences
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await fetch("https://api.radar.io/v1/geofences", {
          headers: {
            Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch geofences");
          return;
        }

        const data = await response.json();
        setGeofences(data.geofences || []);
      } catch (error) {
        console.error("Failed to fetch geofences:", error);
      }
    };
    fetchGeofences();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.radar.io/v1/users", {
          headers: {
            Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch users");
          return;
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  // console.log({ trips, geofences, users });

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Daftar Perjalanan</h1>

      {/* <Button className="mb-4" onClick={handleAddPlace}>
        <MapPinPlus className="inline" />
        Tambahkan Tempat
      </Button> */}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="text-left">ID</TableHead> */}
              <TableHead className="text-left">ID Perjalanan</TableHead>
              <TableHead className="text-left">ID Pengguna</TableHead>
              <TableHead className="text-left">ID Tempat</TableHead>
              <TableHead className="text-left">Nama Pengguna</TableHead>
              <TableHead className="text-left">Nama Tempat</TableHead>
              <TableHead className="text-left">Tag</TableHead>
              <TableHead className="text-left">Berangkat</TableHead>
              <TableHead className="text-left">Tiba</TableHead>
              {/* <TableHead className="text-left">Tipe</TableHead> */}
              {/* <TableHead className="text-left">Mode</TableHead> */}
              {/* <TableHead className="text-left">Koordinat (Latitude, Longitude)</TableHead> */}
              <TableHead className="text-left">Status</TableHead>
              {/* <TableHead className="text-left">Aksi</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip._id} className="hover:bg-gray-50">
                {/* <TableCell>{trip._id || "-"}</TableCell> */}
                <TableCell>{trip.externalId || "-"}</TableCell>
                <TableCell>{trip.userId || "-"}</TableCell>
                <TableCell>{trip.destinationGeofenceExternalId || "-"}</TableCell>
                <TableCell>
                  {users.find((user) => user.userId === trip.userId)?.metadata.username || "-"}
                </TableCell>
                <TableCell>
                  {geofences.find((geofence) => geofence.externalId === trip.destinationGeofenceExternalId)?.description || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{trip.destinationGeofenceTag || "-"}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(trip.startedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                </TableCell>
                <TableCell>
                  {new Date(trip.endedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                </TableCell>
                {/* <TableCell>{trip.type}</TableCell> */}
                {/* <TableCell>{trip.mode}</TableCell> */}
                {/* <TableCell>{trip.geometryCenter.coordinates[1]}, {trip.geometryCenter.coordinates[0]}</TableCell> */}
                <TableCell>
                  <Badge
                    variant={
                      trip.status === "arrived" || trip.status === "completed"
                        ? "success"
                        : trip.status === "pending" || trip.status === "started" || trip.status === "approaching"
                          ? "warning"
                          : trip.status === "expired" ? "secondary" : "destructive"
                    }
                  >
                    {trip.status === "started" && "Dimulai"}
                    {trip.status === "pending" && "Menunggu"}
                    {trip.status === "approaching" && "Mendekati"}
                    {trip.status === "arrived" && "Tiba"}
                    {trip.status === "completed" && "Selesai"}
                    {trip.status === "expired" && "Kadaluarsa"}
                    {trip.status === "canceled" && "Dibatalkan"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {trips.length === 0 && (
        <div className="mt-4 text-center text-gray-500">Tidak ada data perjalanan untuk ditampilkan.</div>
      )}
    </div>
  );
}
