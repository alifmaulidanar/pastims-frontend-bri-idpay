/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import { useDropzone } from "react-dropzone";
import "leaflet-geosearch/dist/geosearch.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GeofenceRadar as Geofence } from "@/types";
import { getLastGeofenceIndex } from "@/lib/actions";
import { fetchGeofencesRadar } from "@/lib/geofences";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download, MapPinPlus, Pencil, Save, SearchIcon, Trash2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Define custom icons
import geofenceIconUrl from "../../../assets/marker-icons/marker-icon.png";

const csvGeofencesTemplate = new URL("@/assets/csv-templates/geofences-template.csv", import.meta.url).href;
const BASE_URL = import.meta.env.VITE_abu;

export default function Places() {
  const queryClient = useQueryClient();
  const [filteredGeofences, setFilteredGeofences] = useState<Geofence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [openAddPlaceDialog, setOpenAddPlaceDialog] = useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [previewCoordinates, setPreviewCoordinates] = useState<[number, number] | null>([-6.2088, 106.8456]);
  const [previewRadius, setPreviewRadius] = useState<number>(0);
  const [formValues, setFormValues] = useState({ latitude: "", longitude: "", radius: "", description: "", tag: "" });
  const [openUploadDialog, setOpenUploadDialog] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [devMode, setDevMode] = useState(false);

  // Create custom icons
  const geofenceIcon = L.icon({
    iconUrl: geofenceIconUrl,
    iconSize: [36, 36],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, []);

  // Fetch geofences
  const { data: geofencesData, isLoading, error } = useQuery({
    queryKey: ["allGeofences"],
    queryFn: fetchGeofencesRadar,
    initialData: [],
  })

  const geofences = geofencesData ?? [];

  useEffect(() => {
    filterAndSortGeofences();
  }, [geofences, searchQuery, statusFilter, tagFilter, sortOrder, devMode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSort = (key: string) => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setSortKey(key);
    filterAndSortGeofences();
  };

  const getSortIcon = (key: string) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return null;
  };

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status);
  };

  const handleFilterTag = (tag: string) => {
    setTagFilter(tag);
  };

  const filterAndSortGeofences = () => {
    if (!geofences) return;

    let filtered = [...geofences];

    if (!devMode) {
      filtered = filtered.filter((g) => g.tag !== "testing");
    }

    if (statusFilter) {
      filtered = filtered.filter((g) => (statusFilter === "Aktif" ? g.enabled : !g.enabled));
    }

    if (tagFilter && tagFilter !== "Semua") {
      filtered = filtered.filter((g) => g.tag === tagFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (g) =>
          g.externalId?.toLowerCase().includes(searchQuery) ||
          g.description?.toLowerCase().includes(searchQuery) ||
          g.tag?.toLowerCase().includes(searchQuery)
      );
    }

    filtered.sort((a, b) => {
      const aValue = String((a as any)[sortKey] ?? "").toLowerCase();
      const bValue = String((b as any)[sortKey] ?? "").toLowerCase();
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    setFilteredGeofences(filtered);
  };

  // Fetch geofence details
  const handleAddPlace = () => {
    setSelectedGeofence(null);
    setFormValues({ latitude: "", longitude: "", radius: "", description: "", tag: "" });
    setOpenAddPlaceDialog(true);
  };

  // Update form coordinates
  const updateFormCoordinates = (lat: number, lng: number) => {
    setFormValues({
      ...formValues,
      latitude: lat.toString(),
      longitude: lng.toString()
    });
    setPreviewCoordinates([lat, lng]);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });

    if (name === "latitude" || name === "longitude") {
      const lat = parseFloat(formValues.latitude);
      const lng = parseFloat(formValues.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        setPreviewCoordinates([lat, lng]);
      }
    }

    if (name === "radius") {
      setPreviewRadius(parseFloat(value) || 0);
    }
  };

  // Handle submit add place
  const handleSubmitAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = formValues.tag;

    // Get latest geofence index
    const latestGeofenceIndex = await getLastGeofenceIndex();
    if (!latestGeofenceIndex) {
      console.error('Failed to get latest geofence index');
      return;
    }

    // Generate new index and external ID
    const newIndex = latestGeofenceIndex + 1;
    const externalId = `LK${newIndex}`;

    const body = {
      description: formValues.description,
      type: "circle",
      coordinates: [parseFloat(formValues.longitude), parseFloat(formValues.latitude)],
      radius: parseFloat(formValues.radius),
      // tag: formData.get("tag") as string,
      // externalId: uuidv4(),
      // type: formData.get("type") as string,
      // geometry: {
      //   type: "Point",
      //   coordinates: [formData.get("longitude"), formData.get("latitude")],
      // },
      // geometryRadius: formData.get("radius"),
      // enabled: true,
    };
    try {
      const url = `https://api.radar.io/v1/geofences/${tag}/${externalId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_rlsk,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error("Failed to save geofence");
        return;
      }

      const data = await response.json();

      // Save to backend
      try {
        const saveToBackend = {
          radar_id: data.geofence._id,
          external_id: data.geofence.externalId,
          description: data.geofence.description,
          tag: data.geofence.tag,
          type: data.geofence.type,
          radius: data.geofence.geometryRadius,
          coordinates: data.geofence.geometryCenter.coordinates,
        }
        const response = await fetch(`${BASE_URL}/geofence`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveToBackend),
        });

        if (!response.ok) {
          console.error("Failed to save geofence");
          return;
        }
      } catch (error) {
        console.error("Failed to save geofence", error);
      }

      setOpenAddPlaceDialog(false);
      await queryClient.invalidateQueries({ queryKey: ["allGeofences"] });
      window.location.reload();
    } catch (error) {
      console.error("Failed to add geofence:", error);
    }
  };

  // Map with search and draw
  function MapWithSearchAndDraw() {
    const map = useMapEvents({
      click(e: any) {
        updateFormCoordinates(e.latlng.lat, e.latlng.lng);
      },
    });

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = SearchControl({
        provider,
        style: "bar",
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: false,
        retainZoomLevel: true,
        animateZoom: true,
        keepResult: true,
      });

      // Handle search results
      map.addControl(searchControl);
      map.on("geosearch/showlocation", (event: any) => {
        const { lat, lng } = event.location;
        updateFormCoordinates(lat, lng);
        map.setView([lat, lng], 17);
      });
      return () => map.removeControl(searchControl);
    }, [map]);

    useEffect(() => {
      if (previewCoordinates) {
        map.setView(previewCoordinates, 20);
      }
    }, [previewCoordinates, map]);

    return null;
  }

  // Handle edit place
  const handleEditPlace = async (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setFormValues({
      latitude: geofence?.geometryCenter.coordinates[1].toString() || "",
      longitude: geofence?.geometryCenter.coordinates[0].toString() || "",
      radius: geofence?.geometryRadius.toString() || "",
      description: geofence?.description || "",
      tag: geofence?.tag || "",
    });
    setPreviewCoordinates([geofence.geometryCenter.coordinates[1], geofence.geometryCenter.coordinates[0]]);
    setPreviewRadius(geofence.geometryRadius);
    setOpenAddPlaceDialog(true);
  };

  // Handle delete place
  const handleDeletePlace = async () => {
    if (!selectedGeofence) return;
    const { tag, externalId } = selectedGeofence;
    try {
      if (!tag || !externalId) {
        console.error("Invalid geofence tag or external ID");
        return;
      }

      const response = await fetch(`https://api.radar.io/v1/geofences/${tag}/${externalId}`, {
        method: "DELETE",
        headers: {
          Authorization: import.meta.env.VITE_rlsk,
        },
      });

      if (!response.ok) {
        console.error("Failed to delete geofence");
        return;
      }

      // Delete from backend
      try {
        const radar_id = selectedGeofence._id;
        const response = await fetch(`${BASE_URL}/geofence/${radar_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to save geofence to the backend");
          return;
        }
      } catch (error) {
        console.error("Failed to save geofence to the backend:", error);
      }

      setOpenAlertDialog(false);
      await queryClient.invalidateQueries({ queryKey: ["allGeofences"] });
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete geofence:", error);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    try {
      const response = await fetch(`${BASE_URL}/geofence/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to upload tickets");
        setUploading(false);
        return;
      }

      const data = await response.json();
      if (data.error) {
        console.error("Error uploading tickets:", data.error);
        setUploading(false);
        return;
      }

      setOpenUploadDialog(false);
      setSelectedFile(null);
      setUploading(false);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading tickets:", error);
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  // Handle download CSV
  const downloadCSV = () => {
    if (filteredGeofences.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    // Column Header CSV
    const headers = [
      "ID Tempat",
      "Nama Tempat",
      "Tag",
      "Radius (m)",
      "Koordinat (Latitude, Longitude)",
      "Status"
    ];

    // Table Data
    const rows = filteredGeofences.map((geofence) => [
      geofence.externalId || "-",
      geofence.description || "-",
      geofence.tag || "-",
      geofence.geometryRadius || "-",
      `${geofence.geometryCenter.coordinates[1]}, ${geofence.geometryCenter.coordinates[0]}`,
      geofence.enabled ? "Aktif" : "Tidak Aktif"
    ]);

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
    link.setAttribute("download", `data-tempat-${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchCoordinates = () => {
    const lat = parseFloat(formValues.latitude);
    const lng = parseFloat(formValues.longitude);
    if (
      !isNaN(lat) && lat >= -90 && lat <= 90 &&
      !isNaN(lng) && lng >= -180 && lng <= 180
    ) {
      setPreviewCoordinates([lat, lng]);
    } else {
      alert("Koordinat tidak valid. Pastikan latitude di antara -90 hingga 90, dan longitude di antara -180 hingga 180.");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading places: {error.message}</div>;

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      {/* Set Page Title */}
      <Helmet>
        <title>Tempat</title>
      </Helmet>

      <h1 className="mb-4 text-2xl font-semibold">Daftar Tempat</h1>

      <div className="flex items-center mb-4 space-x-4">
        {/* Add place button */}
        <Button onClick={handleAddPlace}>
          <MapPinPlus className="inline" />
          Tambahkan Tempat
        </Button>

        {/* Upload CSV button */}
        <Button variant="secondary" onClick={() => setOpenUploadDialog(true)}>
          <Upload className="inline" />
          Unggah CSV
        </Button>

        {/* Download CSV Template */}
        <div>
          <a
            href={csvGeofencesTemplate}
            download="geofences-template.csv"
            className="text-blue-500 hover:underline"
          >
            Unduh Template Tempat CSV (.csv)
          </a>
        </div>
      </div>

      <Dialog open={openUploadDialog} onOpenChange={setOpenUploadDialog}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Unggah File CSV
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            File yang diunggah harus tipe CSV dan mengikuti format sesuai template. Disarankan setelah mengunduh template, gunakan Notepad untuk mengedit isi CSV dan dapatkan koordinat latitude dan longitude dari Google Maps.
          </DialogDescription>

          <div
            {...getRootProps({ className: "w-full h-48 border-2 border-dashed rounded flex justify-center items-center" })}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <p>{`File: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`}</p>
            ) : (
              <p>Tarik dan lepaskan file CSV di sini atau klik untuk memilih file</p>
            )}
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" onClick={() => { setSelectedFile(null); setOpenUploadDialog(false); }}>
              Batal
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? "Mengunggah..." : "Unggah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search, Sort, and Filter */}
      <div className="flex items-center mb-4 space-x-4">
        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Cari tempat..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />

        {/* Filter by Status */}
        <Select
          onValueChange={(value) => handleFilterStatus(value)}
          value={statusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter by Tag */}
        <Select
          onValueChange={(value) => handleFilterTag(value)}
          value={tagFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Tag</SelectItem>
            {[...new Set(geofences.map((geofence) => geofence.tag))]
              .filter((tag) => devMode || tag !== "testing")
              .map((tag) => (
                <SelectItem key={tag} value={tag ?? ""}>
                  {tag}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Download CSV button */}
        <Button onClick={downloadCSV} variant="secondary">
          <Download className="inline" />
          Unduh Data Tempat
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
          Menampilkan tempat: {filteredGeofences.length}
        </p>
      </div>
      <div className='mb-2'>
        <p className="text-sm text-gray-500">
          Klik pada <span className='italic'>header</span> kolom untuk mengurutkan data.
        </p>
      </div>
      {/* <div className="flex items-center justify-between mt-4">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          variant="outline"
        >
          Sebelumnya
        </Button>
        <p>
          Halaman {currentPage} dari{" "}
          {Math.ceil(geofences.length / itemsPerPage)}
        </p>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(geofences.length / itemsPerPage)}
          variant="outline"
        >
          Selanjutnya
        </Button>
      </div> */}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead onClick={() => handleSort("externalId")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("externalId")}
                  ID Tempat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("description")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("description")}
                  Nama Tempat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("tag")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("tag")}
                  Tag
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("geometryRadius")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("geometryRadius")}
                  Radius (m)
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("geometryCenter.coordinates")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("geometryCenter.coordinates")}
                  Koordinat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("enabled")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("enabled")}
                  Status
                </div>
              </TableHead>
              {/* <TableHead className="text-left">ID</TableHead> */}
              {/* <TableHead className="text-left">ID Tempat</TableHead>
              <TableHead className="text-left">Nama Tempat</TableHead> */}
              {/* <TableHead className="text-left">Tag</TableHead> */}
              {/* <TableHead className="text-left">Tipe</TableHead> */}
              {/* <TableHead className="text-left">Radius (m)</TableHead>
              <TableHead className="text-left">Koordinat (Latitude, Longitude)</TableHead>
              <TableHead className="text-left">Status</TableHead> */}
              <TableHead className="text-left">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {paginatedGeofences.map((geofence) => ( */}
            {filteredGeofences.map((geofence, index) => (
              <TableRow key={geofence._id} className="hover:bg-gray-50">
                <TableCell>{index + 1}</TableCell>
                {/* <TableCell>{geofence._id || "-"}</TableCell> */}
                <TableCell>{geofence.externalId || "-"}</TableCell>
                <TableCell>{geofence.description || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{geofence.tag || "-"}</Badge>
                </TableCell>
                {/* <TableCell>{geofence.type}</TableCell> */}
                <TableCell>{geofence.geometryRadius}</TableCell>
                <TableCell>
                  {geofence.geometryCenter.coordinates[1]}, {geofence.geometryCenter.coordinates[0]}
                </TableCell>
                <TableCell>{geofence.enabled ? "Aktif" : "Tidak Aktif"}</TableCell>
                <TableCell>
                  <div className='flex flex-nowrap'>
                    <Button onClick={() => handleEditPlace(geofence)} variant="outline" className="mr-2">
                      <Pencil className="inline" />
                      {/* Edit */}
                    </Button>
                    <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" onClick={() => setSelectedGeofence(geofence)}>
                          <Trash2 className="inline" />
                          {/* Hapus */}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Tempat</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus <span className='font-bold'>{selectedGeofence?.description}</span>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        {/* <div>Apakah Anda yakin ingin menghapus <span className='font-bold'>{selectedGeofence?.description}</span>?</div> */}
                        <AlertDialogFooter>
                          <Button variant="outline" onClick={() => setOpenAlertDialog(false)}>
                            <X className="inline" />
                            Batal
                          </Button>
                          <Button variant="destructive" onClick={handleDeletePlace}>
                            <Trash2 className="inline" />
                            Hapus
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {geofences.length === 0 && (
        <div className="mt-4 text-center text-gray-500">Tidak ada data tempat untuk ditampilkan.</div>
      )}

      {/* Add Place Dialog/Modal */}
      <Dialog open={openAddPlaceDialog} onOpenChange={setOpenAddPlaceDialog}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <DialogTitle>{selectedGeofence ? "Edit Tempat" : "Tambahkan Tempat"}</DialogTitle>
          <DialogDescription>
            {selectedGeofence ? "Edit tempat yang sudah ada" : "Tambahkan tempat baru dengan cara mengisi koordinat lokasi, lalu klik tombol \"Cari\" atau masukkan nama tempat di kolom pencarian."}
          </DialogDescription>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <form className="space-y-4" onSubmit={handleSubmitAddPlace}>
              <div className="items-center">
                <Label>Deskripsi</Label>
                <input
                  type="text"
                  name="description"
                  placeholder="Deskripsi"
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div className="items-center">
                <Label>Tag</Label>
                <input
                  type="text"
                  name="tag"
                  placeholder="Tag (kelompok)"
                  value={formValues.tag}
                  onChange={(e) => setFormValues({ ...formValues, tag: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div className="items-center">
                <Label>Radius (m)</Label>
                <input
                  type="number"
                  name="radius"
                  placeholder="Radius (meter)"
                  value={formValues.radius}
                  onChange={handleFormChange}
                  // onChange={(e) => setFormValues({ ...formValues, radius: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div className="items-center">
                <Label>Koordinat</Label>
                <div className="grid items-stretch grid-cols-6 gap-4">
                  <div className="grid grid-cols-2 col-span-5 gap-4">
                    <input
                      type="number"
                      name="latitude"
                      placeholder="Latitude"
                      value={formValues.latitude}
                      onChange={(e) => setFormValues({ ...formValues, latitude: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                    <input
                      type="number"
                      name="longitude"
                      placeholder="Longitude"
                      value={formValues.longitude}
                      onChange={(e) => setFormValues({ ...formValues, longitude: e.target.value })}
                      className="w-full px-4 py-2 border rounded"
                    />
                  </div>
                  <div className="flex items-center">
                    <Button onClick={handleSearchCoordinates} variant="default" className="w-full h-full">
                      <SearchIcon className="inline" />
                      Cari
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-2">
                <Button variant="outline" onClick={() => setOpenAddPlaceDialog(false)}>
                  <X className="inline" />
                  Batal
                </Button>
                <Button type="submit">
                  <Save className="inline" />
                  {selectedGeofence ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </div>
            </form>

            {/* Map Preview */}
            <div className="w-full overflow-hidden border rounded h-96">
              <MapContainer
                center={previewCoordinates || [-6.2088, 106.8456]}
                zoom={previewCoordinates ? 20 : 11}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapWithSearchAndDraw />
                {previewCoordinates && (
                  <>
                    <Marker position={previewCoordinates} icon={geofenceIcon}></Marker>
                    <Circle
                      center={previewCoordinates}
                      radius={previewRadius}
                      pathOptions={{ color: "blue" }}
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
