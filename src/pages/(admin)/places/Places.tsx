import { useEffect, useState } from "react";
import { GeofenceRadar as Geofence } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Places() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
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

  return (
    <div className="w-full max-w-screen-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Daftar Tempat</h1>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nama Tempat</TableHead>
              <TableHead className="text-left">Tag</TableHead>
              <TableHead className="text-left">External ID</TableHead>
              <TableHead className="text-left">Tipe</TableHead>
              <TableHead className="text-left">Radius (m)</TableHead>
              <TableHead className="text-left">Koordinat</TableHead>
              <TableHead className="text-left">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geofences.map((geofence) => (
              <TableRow key={geofence._id} className="hover:bg-gray-50">
                <TableCell>{geofence.description || "-"}</TableCell>
                <TableCell>{geofence.tag || "-"}</TableCell>
                <TableCell>{geofence.externalId || "-"}</TableCell>
                <TableCell>{geofence.type}</TableCell>
                <TableCell>{geofence.geometryRadius}</TableCell>
                <TableCell>
                  {geofence.geometryCenter.coordinates[1]}, {geofence.geometryCenter.coordinates[0]}
                </TableCell>
                <TableCell>{geofence.enabled ? "Aktif" : "Tidak Aktif"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {geofences.length === 0 && (
        <div className="mt-4 text-center text-gray-500">Tidak ada data geofence untuk ditampilkan.</div>
      )}
    </div>
  );
}
