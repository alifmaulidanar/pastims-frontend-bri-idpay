/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { fetchTrips } from "@/lib/trips";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Trips() {
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("destinationGeofenceExternalId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [devMode, setDevMode] = useState(false);

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, []);

  // Fetch Tickets
  const { data: tripsData, isLoading, error } = useQuery({
    queryKey: ['allTickets'],
    queryFn: fetchTrips,
    // refetchInterval: 300000, // Refetch every 5 minutes
  });

  const users = tripsData?.users ?? [];
  const geofences = tripsData?.geofences ?? [];
  const trips = tripsData?.trips ?? [];

  // useEffect(() => {
  //   if (trips) {
  //     filterAndSortTrips(trips, searchQuery, statusFilter, sortOrder, devMode);
  //   }
  // }, [trips, searchQuery, statusFilter, sortOrder, devMode]);

  useEffect(() => {
    if (trips.length > 0) {
      filterAndSortTrips(trips);
    }
  }, [trips, searchQuery, statusFilter, sortOrder, devMode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);
    filterAndSortTrips(trips, key, order);
  };

  const getSortIcon = (key: string) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return null;
  };

  const handleFilter = (status: string) => {
    setStatusFilter(status);
  };

  const filterAndSortTrips = (data: any[], sortKeyParam = sortKey, order = sortOrder) => {
    if (!Array.isArray(data)) return;

    let filtered = [...data]; // Salin array agar tidak merusak data asli
    const statusMapping: Record<string, string> = {
      started: "Dimulai",
      pending: "Menunggu",
      approaching: "Mendekati",
      arrived: "Tiba",
      completed: "Selesai",
      expired: "Kadaluarsa",
      canceled: "Dibatalkan",
    };

    if (!devMode) {
      filtered = filtered.filter((trip) => trip?.destinationGeofenceTag !== "testing");
    }

    // Filter berdasarkan status
    if (["assigned", "on_progress", "completed", "canceled", "expired"].includes(statusFilter)) {
      filtered = filtered.filter((trip) => trip.status === statusFilter);
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      filtered = filtered.filter((trip) =>
        trip.externalId?.toLowerCase().includes(searchQuery) ||
        trip.destinationGeofenceExternalId?.toLowerCase().includes(searchQuery) ||
        users.find((user) => user.userId === trip.userId)?.metadata.user_id?.toLowerCase().includes(searchQuery) ||
        trip.destinationGeofenceTag?.toLowerCase().includes(searchQuery) ||
        geofences.find((geofence) => geofence.external_id === trip.destinationGeofenceExternalId)?.description?.toLowerCase().includes(searchQuery) ||
        users.find((user) => user.userId === trip.userId)?.metadata.username?.toLowerCase().includes(searchQuery)
      );
    }

    // Sorting data
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortKeyParam] ?? "";
      let bValue: string | number = b[sortKeyParam] ?? "";

      if (sortKeyParam === "destinationGeofenceExternalId") {
        aValue = geofences.find((g) => g.external_id === a.destinationGeofenceExternalId)?.description || "";
        bValue = geofences.find((g) => g.external_id === b.destinationGeofenceExternalId)?.description || "";
      }

      if (sortKeyParam === "username") {
        aValue = users.find((u) => u.userId === a.userId)?.metadata.username || "";
        bValue = users.find((u) => u.userId === b.userId)?.metadata.username || "";
      }

      if (sortKeyParam === "status") {
        aValue = statusMapping[a.status] || a.status;
        bValue = statusMapping[b.status] || b.status;
      }

      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
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
      const geofence = geofences.find((g) => g.external_id === trip.destinationGeofenceExternalId)?.description || "-";

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
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
    link.setAttribute("download", `data-perjalanan-${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading trips: {error.message}</div>;

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      {/* Set Page Title */}
      <Helmet>
        <title>Perjalanan</title>
      </Helmet>

      <h1 className="mb-4 text-2xl font-semibold">Daftar Perjalanan</h1>

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

        {/* Download CSV button */}
        <Button onClick={downloadCSV} variant="secondary">
          <Download className="inline" />
          Unduh Data Perjalanan
        </Button>

        {/* Development Mode Toggle */}
        <div className="flex items-center mb-6 space-x-4">
          <Switch
            id="dev-mode-toggle"
            checked={devMode}
            onCheckedChange={(checked) => setDevMode(checked)}
          />
          <label htmlFor="dev-mode-toggle" className="text-sm font-medium">
            Development Mode
          </label>
        </div>
      </div>

      <div className='mb-2'>
        <p className="text-sm font-bold text-gray-500">
          Menampilkan perjalanan: {filteredTrips.length}
        </p>
      </div>
      <div className='mb-2'>
        <p className="text-sm text-gray-500">
          Klik pada <span className='italic'>header</span> kolom untuk mengurutkan data.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead onClick={() => handleSort("externalId")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("externalId")}
                  ID Perjalanan
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("userId")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("userId")}
                  ID Pengguna
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("destinationGeofenceExternalId")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("destinationGeofenceExternalId")}
                  ID Tempat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("username")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("username")}
                  Nama Pengguna
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("destinationGeofenceExternalId")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("destinationGeofenceExternalId")}
                  Nama Tempat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("destinationGeofenceTag")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("destinationGeofenceTag")}
                  Tag
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("startedAt")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("startedAt")}
                  Berangkat (WIB)
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("endedAt")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("endedAt")}
                  Tiba (WIB)
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("status")}>
                <div className="flex items-center gap-x-2">
                  {getSortIcon("status")}
                  Status
                </div>
              </TableHead>
              {/* <TableHead className="text-left">ID</TableHead> */}
              {/* <TableHead className="text-left">ID Perjalanan</TableHead>
              <TableHead className="text-left">ID Pengguna</TableHead>
              <TableHead className="text-left">ID Tempat</TableHead>
              <TableHead className="text-left">Nama Pengguna</TableHead>
              <TableHead className="text-left">Nama Tempat</TableHead>
              <TableHead className="text-left">Tag</TableHead>
              <TableHead className="text-left">Berangkat (WIB)</TableHead>
              <TableHead className="text-left">Tiba (WIB)</TableHead> */}
              {/* <TableHead className="text-left">Tipe</TableHead> */}
              {/* <TableHead className="text-left">Mode</TableHead> */}
              {/* <TableHead className="text-left">Koordinat (Latitude, Longitude)</TableHead> */}
              {/* <TableHead className="text-left">Status</TableHead> */}
              {/* <TableHead className="text-left">Aksi</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrips.map((trip) => (
              <TableRow key={trip._id} className="hover:bg-gray-50">
                <TableCell>{filteredTrips.indexOf(trip) + 1}</TableCell>
                <TableCell>{trip.externalId || "-"}</TableCell>
                <TableCell>{trip.userId || "-"}</TableCell>
                <TableCell>{trip.destinationGeofenceExternalId || "-"}</TableCell>
                <TableCell>
                  {users.find((user) => user.userId === trip.userId)?.metadata.username || "-"}
                </TableCell>
                <TableCell>
                  {geofences.find((geofence) => geofence.external_id === trip.destinationGeofenceExternalId)?.description || "-"}
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
