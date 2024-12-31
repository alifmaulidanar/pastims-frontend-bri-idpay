/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { Download } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { UserRadar as User } from "@/types";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
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
        filterAndSortTrips(data.trips, searchQuery, statusFilter, sortOrder);
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

  useEffect(() => {
    filterAndSortTrips(trips, searchQuery, statusFilter, sortOrder);
  }, [trips, searchQuery, statusFilter, sortOrder]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    filterAndSortTrips(trips, searchQuery, statusFilter, order, key);
  };

  const handleFilter = (status: string) => {
    setStatusFilter(status);
  };

  const filterAndSortTrips = (data: any, query: any, status: any, order: any, sortKey = "destinationGeofenceExternalId") => {
    let filtered = data;

    // Filter by status
    if (status === "assigned" || status === "on_progress" || status === "completed" || status === "canceled" || status === "expired") {
      filtered = filtered.filter((trip: any) => trip.status === status);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (trip: any) =>
          trip.externalId.toLowerCase().includes(query) ||
          trip.destinationGeofenceExternalId.toLowerCase().includes(query) ||
          users.find((user) => user.userId === trip.userId)?.metadata.user_id.toLowerCase().includes(query) ||
          trip.destinationGeofenceTag.toLowerCase().includes(query) ||
          geofences.find((geofence) => geofence.externalId === trip.destinationGeofenceExternalId)?.description.toLowerCase().includes(query) ||
          users.find((user) => user.userId === trip.userId)?.metadata.username.toLowerCase().includes(query)
      );
    }

    // Sort data
    filtered = filtered.sort((a: any, b: any) => {
      const compareA = String(a[sortKey]).toLowerCase();
      const compareB = String(b[sortKey]).toLowerCase();
      return order === "asc"
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    });

    setFilteredTrips(filtered);
  };

  const downloadCSV = () => {
    if (filteredTrips.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    // Column Header CSV
    const headers = [
      "ID Perjalanan",
      "ID Pengguna",
      "ID Tempat",
      "Nama Pengguna",
      "Nama Tempat",
      "Tag",
      "Berangkat (WIB)",
      "Tiba (WIB)",
      "Status"
    ];

    // Table Data
    const rows = filteredTrips.map((trip) => {
      const user = users.find((u) => u.userId === trip.userId)?.metadata.username || "-";
      const geofence = geofences.find((g) => g.externalId === trip.destinationGeofenceExternalId)?.description || "-";

      return [
        trip.externalId || "-",
        trip.userId || "-",
        trip.destinationGeofenceExternalId || "-",
        user,
        geofence,
        trip.destinationGeofenceTag || "-",
        new Date(trip.startedAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(".", ":"),
        new Date(trip.endedAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(".", ":"),
        trip.status === "started"
          ? "Dimulai"
          : trip.status === "pending"
            ? "Menunggu"
            : trip.status === "approaching"
              ? "Mendekati"
              : trip.status === "arrived"
                ? "Tiba"
                : trip.status === "completed"
                  ? "Selesai"
                  : trip.status === "expired"
                    ? "Kadaluarsa"
                    : "Dibatalkan",
      ];
    });

    // Combine headers and rows
    const csvContent =
      [headers.join(";"), ...rows.map((row) => row.map((value) => `"${value}"`).join(";"))].join("\n");

    // Create Blob object to store CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Trigger file download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "trips-data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      {/* Set Page Title */}
      <Helmet>
        <title>Perjalanan</title>
      </Helmet>

      <h1 className="mb-6 text-2xl font-semibold">Daftar Perjalanan</h1>

      {/* Search, Sort, and Filter */}
      <div className="flex items-center mb-4 space-x-4">
        <Input
          type="text"
          placeholder="Cari perjalanan..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />
        <Select
          onValueChange={handleFilter}
          value={statusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="assigned">Ditugaskan</SelectItem>
            <SelectItem value="on_progress">Berjalan</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="canceled">Dibatalkan</SelectItem>
            <SelectItem value="expired">Kadaluarsa</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => handleSort("destinationGeofenceExternalId")}>
          Urutkan ({sortOrder === "asc" ? "A-Z" : "Z-A"})
        </Button>

        {/* Download CSV button */}
        <Button onClick={downloadCSV} variant="secondary">
          <Download className="inline" />
          Unduh Data Perjalanan
        </Button>
      </div>

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
              <TableHead className="text-left">Berangkat (WIB)</TableHead>
              <TableHead className="text-left">Tiba (WIB)</TableHead>
              {/* <TableHead className="text-left">Tipe</TableHead> */}
              {/* <TableHead className="text-left">Mode</TableHead> */}
              {/* <TableHead className="text-left">Koordinat (Latitude, Longitude)</TableHead> */}
              <TableHead className="text-left">Status</TableHead>
              {/* <TableHead className="text-left">Aksi</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.map((trip) => (
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
                  {new Date(trip.startedAt).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).replace('.', ':')}
                </TableCell>
                <TableCell>
                  {new Date(trip.endedAt).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).replace('.', ':')}
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
