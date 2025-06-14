/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { fetchDBTrips } from "@/lib/trips";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { LoadingOverlay } from "@/components/customs/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const PROJECT_MODE = import.meta.env.VITE_PROJECT_MODE;

export default function Trips() {
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("destinationGeofenceExternalId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);  // Default: 10 items per page
  const [currentPage, setCurrentPage] = useState(1);  // Default: Page 1
  const [totalPages, setTotalPages] = useState(1);  // Default: 1 page
  const [goToPage, setGoToPage] = useState<string>('');  // Go to page input
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
  const { data: tripsData, isLoading: isDataLoading, error } = useQuery({
    queryKey: ['allTrips', pageSize, currentPage, devMode],
    queryFn: ({ queryKey }) => fetchDBTrips({
      queryKey: queryKey as [string, number, number],
      devMode: devMode,
    }),
    initialData: { trips: [], count: 0 },
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isDataLoading) {
      setLoadingMessage("Memuat data perjalanan...");
      setIsLoading(true);
    }

    if (!isDataLoading && isMounted.current) {
      setIsLoading(false);
    }
  }, [isDataLoading]);

  // const { trips, count } = tripsData ?? { trips: [], count: 0 };
  const { trips, count } = tripsData ?? { trips: [], count: 0 };

  useEffect(() => {
    setTotalPages(Math.ceil(count / pageSize));
  }, [count, pageSize]);

  // Pagination controls
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage('');
    }
  };

  useEffect(() => {
    if (trips.length > 0) {
      filterAndSortTrips();
    }
  }, [currentPage, trips, searchQuery, statusFilter, sortOrder, devMode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);
    filterAndSortTrips();
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

  const filterAndSortTrips = () => {
    if (!trips) return;

    let filtered = [...trips];
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
      filtered = filtered.filter((trip) => trip?.geofenceTag !== "testing" && trip?.username !== "[DevUser]" && trip?.username !== "[DevClient]");
    }

    // Filter berdasarkan status
    if (["assigned", "started", "completed", "canceled", "expired"].includes(statusFilter)) {
      filtered = filtered.filter((trip) => trip.status === statusFilter);
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      filtered = filtered.filter((trip) =>
        trip.externalId.toLowerCase().includes(searchQuery) ||
        trip.userId.toLowerCase().includes(searchQuery) ||
        trip.geofenceId.toLowerCase().includes(searchQuery) ||
        trip.username.toLowerCase().includes(searchQuery) ||
        trip.geofenceDescription.toLowerCase().includes(searchQuery) ||
        trip.geofenceTag.toLowerCase().includes(searchQuery) ||
        new Date(trip.createdAt).toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace('.', ':').toLowerCase().includes(searchQuery) ||
        new Date(trip.updatedAt).toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace('.', ':').toLowerCase().includes(searchQuery) ||
        statusMapping[trip.status].toLowerCase().includes(searchQuery)
      );
    };

    filtered.sort((a, b) => {
      const aValue = String((a as any)[sortKey] ?? "").toLowerCase();
      const bValue = String((b as any)[sortKey] ?? "").toLowerCase();
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
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
      return [
        trip.externalId || "-",
        trip.userId || "-",
        trip.geofenceId || "-",
        trip.username || "-",
        trip.geofenceDescription || "-",
        trip.geofenceTag || "-",
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
        new Date(trip.createdAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(".", ":"),
        new Date(trip.updatedAt).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).replace(".", ":"),
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

  if (error) return <div>Error loading trips: {error.message}</div>;

  return (
    <div className="w-[88%] max-w-screen-xxl p-6">
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
            <SelectItem value="started">Berjalan</SelectItem>
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
        {PROJECT_MODE === "development" && (
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
        )}
      </div>

      <div className='flex items-end mb-2 gap-x-4'>
        <Select
          onValueChange={(value) => {
            const newSize = value === 'all' ? count : parseInt(value);
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          value={pageSize === count ? 'all' : pageSize.toString()}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">per 10</SelectItem>
            <SelectItem value="20">per 20</SelectItem>
            <SelectItem value="50">per 50</SelectItem>
            <SelectItem value="100">per 100</SelectItem>
            <SelectItem value="all">Semua</SelectItem>
          </SelectContent>
        </Select>
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
        <ScrollArea className="w-full h-[470px] p-4 border rounded-md">
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
                <TableHead onClick={() => handleSort("geofenceId")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("geofenceId")}
                    ID Tempat
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("username")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("username")}
                    Nama Pengguna
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("geofenceDescription")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("geofenceDescription")}
                    Nama Tempat
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("geofenceTag")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("geofenceTag")}
                    Tag
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("createdAt")}
                    Berangkat (WIB)
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("updatedAt")}>
                  <div className="flex items-center gap-x-2">
                    {getSortIcon("updatedAt")}
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
                  <TableCell>{trip.geofenceId || "-"}</TableCell>
                  <TableCell>
                    {trip.username || "-"}
                  </TableCell>
                  <TableCell>
                    {trip.geofenceDescription || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trip.geofenceTag || "-"}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(trip.createdAt).toLocaleString('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).replace('.', ':')} WIB
                  </TableCell>
                  <TableCell>
                    {new Date(trip.updatedAt).toLocaleString('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).replace('.', ':')} WIB
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
          {trips.length === 0 && (
            <div className="mt-4 text-center text-gray-500">Tidak ada data perjalanan untuk ditampilkan.</div>
          )}
        </ScrollArea>
      </div>


      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Total {count} perjalanan • Halaman {currentPage} dari {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="outline"
          >
            Sebelumnya
          </Button>

          {/* Input lompat ke halaman */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">Lompat ke:</span>
            <Input
              type="number"
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              min={1}
              max={totalPages}
              className="w-20"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleGoToPage();
                }
              }}
            />
            <Button
              onClick={handleGoToPage}
              variant="outline"
              disabled={!goToPage || isNaN(parseInt(goToPage))}
            >
              Go
            </Button>
          </div>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Selanjutnya
          </Button>
        </div>
      </div>
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
    </div>
  );
}
