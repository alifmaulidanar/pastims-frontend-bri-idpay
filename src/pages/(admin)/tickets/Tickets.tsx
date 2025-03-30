/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { Ticket } from "@/types";
import DatePicker from "react-datepicker";
import { subDays, format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { fetchTripInfo } from "@/lib/trips";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import "leaflet-geosearch/dist/geosearch.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { fetchTicketPhotos, fetchTickets } from "@/lib/tickets";
import { LoadingOverlay } from "@/components/customs/loading-state";
import { ResponseStatus } from "@/components/customs/response-alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Download, Info, InfoIcon, Pencil, Save, TicketPlus, Trash2, Trash2Icon, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Papa from "papaparse";

const csvTicketsTemplate = new URL("@/assets/csv-templates/new-tickets-template.csv", import.meta.url).href;
const BASE_URL = import.meta.env.VITE_abu;
const BASE_URL2 = import.meta.env.VITE_abu_V2;
const SLSS = import.meta.env.VITE_slss;
const queryClient = new QueryClient();

export default function Tickets() {
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openInfoDialog, setOpenInfoDialog] = useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({ user_id: "", geofence_id: "", description: "", status: "", created_at: "", updated_at: "" });
  const [openUploadDialog, setOpenUploadDialog] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ticketPhotos, setTicketPhotos] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertAction, setAlertAction] = useState<any>("cancel");
  const [apiResponse, setApiResponse] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning'
    title?: string
    description?: string
    errors?: Array<{ message: string, details?: string }>
  }>({ status: 'idle' })
  // const [searchTerm, setSearchTerm] = useState("");
  // const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // const [startDate, setStartDate] = useState<Date | null>(new Date()); // Default: Today
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 1)); // 1 day ago
  const [endDate, setEndDate] = useState<Date | null>(new Date()); // Default: Today

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, []);

  // useEffect(() => {
  //   if (!isSelectOpen) {
  //     setSearchTerm(""); // Reset pencarian saat dropdown ditutup
  //   }
  // }, [isSelectOpen]);

  // Fetch Tickets
  const { data: ticketsData, isLoading: isDataLoading, error, refetch } = useQuery({
    queryKey: ["allTickets", startDate, endDate],
    queryFn: () => fetchTickets(format(startDate || new Date(), "yyyy-MM-dd"), format(endDate || new Date(), "yyyy-MM-dd")),
    // refetchInterval: 600000, // Refetch every 10 minutes
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
      setLoadingMessage("Memuat data tiket...");
      setIsLoading(true);
    }

    if (!isDataLoading && isMounted.current) {
      setIsLoading(false);
    }
  }, [isDataLoading]);

  const users = ticketsData?.users ?? [];
  const geofences = ticketsData?.geofences ?? [];
  const tickets = ticketsData?.tickets ?? [];

  useEffect(() => {
    refetch(); // Refetch data when date range changes
  }, [startDate, endDate]);

  // useEffect(() => {
  //   if (tickets) {
  //     filterAndSortTickets(tickets, searchQuery, statusFilter, sortOrder, devMode);
  //   }
  // }, [tickets, searchQuery, statusFilter, sortOrder, devMode]);

  useEffect(() => {
    if (tickets.length > 0) {
      filterAndSortTickets(tickets);
    }
  }, [tickets, searchQuery, statusFilter, sortOrder, devMode, startDate, endDate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);
    filterAndSortTickets(tickets, key, order);
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

  const filterAndSortTickets = (data: any[], sortKeyParam = sortKey, order = sortOrder) => {
    if (!Array.isArray(data)) return;
    let filtered = [...data];
    const statusMapping: Record<string, string> = {
      assigned: "Ditugaskan",
      on_progress: "Berjalan",
      completed: "Selesai",
      canceled: "Dibatalkan",
    };

    if (startDate && endDate) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.updated_at).toISOString().split('T')[0];
        return ticketDate >= startDate.toISOString().split('T')[0] && ticketDate <= endDate.toISOString().split('T')[0];
      });
    }

    if (!devMode) {
      filtered = filtered.filter(ticket => {
        const user = users.find((user) => user.user_id === ticket.user_id);
        return user?.username !== "[DevUser]";
      });
    }

    // Filter berdasarkan status
    if (["assigned", "on_progress", "completed", "canceled"].includes(statusFilter)) {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter berdasarkan pencarian
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.ticket_id?.toLowerCase().includes(searchQuery) ||
        geofences.find(geofence => geofence.external_id === ticket.geofence_id)?.description?.toLowerCase().includes(searchQuery) ||
        users.find(user => user.user_id === ticket.user_id)?.username?.toLowerCase().includes(searchQuery)
      );
    }

    // Sorting data
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortKeyParam] ?? "";
      let bValue: string | number = b[sortKeyParam] ?? "";

      if (sortKeyParam === "geofence_id") {
        aValue = geofences.find(g => g.external_id === a.geofence_id)?.description || "";
        bValue = geofences.find(g => g.external_id === b.geofence_id)?.description || "";
      }

      if (sortKeyParam === "username") {
        aValue = users.find(u => u.user_id === a.user_id)?.username || "";
        bValue = users.find(u => u.user_id === b.user_id)?.username || "";
      }

      if (sortKeyParam === "status") {
        aValue = statusMapping[a.status] || a.status;
        bValue = statusMapping[b.status] || b.status;
      }

      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    setFilteredTickets(filtered);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenDialog(false);
    setIsLoading(true);
    setLoadingMessage("Menambahkan tiket...");
    try {
      const response = await fetch(`${BASE_URL}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_rlsk,
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal menambahkan tiket',
          description: 'Silakan coba lagi.',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['allTickets'] }); // Refresh data
      setIsLoading(false);
      setApiResponse({
        status: 'success',
        title: 'Tiket berhasil ditambahkan',
        description: 'Tiket baru telah berhasil ditambahkan.',
      });
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket) return;
    setIsEditing(false);
    setOpenDialog(false)
    setIsLoading(true);
    setLoadingMessage("Memperbarui tiket...");

    const ticketData = {
      ticket_id: selectedTicket.ticket_id,
      ...formValues,
    };

    try {
      const response = await fetch(`${BASE_URL}/ticket`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_rlsk,
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal memperbarui tiket',
          description: 'Silakan coba lagi.',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      setIsLoading(false);
      setApiResponse({
        status: 'success',
        title: 'Tiket berhasil diperbarui',
        description: 'Tiket telah berhasil diperbarui.',
      });
    } catch (error) {
      setIsLoading(false);
      setApiResponse({
        status: 'error',
        title: 'Gagal memperbarui tiket',
        description: `Terjadi kesalahan ${error}. Silakan coba lagi.`,
      });
    }
  };

  const handleAddOrUpdate = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setFormValues({
      user_id: ticket?.user_id || "",
      geofence_id: ticket?.geofence_id || "",
      description: ticket?.description || "",
      status: ticket?.status || "",
      created_at: ticket?.created_at || "",
      updated_at: ticket?.updated_at || "",
    });
    setOpenDialog(true);
  };

  const handleInfo = async (ticket: Ticket | null) => {
    const getTicketPhotos = await fetchTicketPhotos(ticket?.ticket_id || "");

    setTripInfo(null);
    if (ticket?.trip_id) {
      const tripData = await fetchTripInfo(ticket.trip_id);
      setTripInfo(tripData);
    }

    setTicketPhotos(getTicketPhotos.photos);
    setSelectedTicket(ticket);
    setFormValues({
      user_id: ticket?.user_id || "",
      geofence_id: ticket?.geofence_id || "",
      description: ticket?.description || "",
      status: ticket?.status || "",
      created_at: ticket?.created_at || "",
      updated_at: ticket?.updated_at || "",
    });
    setOpenInfoDialog(true);
  };

  const handleAlertDialog = (ticket: Ticket | null, action: "cancel" | "delete") => {
    setSelectedTicket(ticket);
    setAlertAction(action);
    setOpenAlertDialog(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const validateCSV = async (file: File) => {
    return new Promise<{ valid: boolean; errors: string[] }>((resolve) => {
      const errors: string[] = [];
      Papa.parse(file, {
        header: true,
        delimiter: ";",
        skipEmptyLines: "greedy",
        encoding: "utf-8",
        complete: (results: any) => {
          // Header validation
          const requiredHeaders = [
            "ID Pengguna",
            "ID Tempat",
            "Deskripsi Tiket"
          ];

          const missingHeaders = requiredHeaders.filter(
            (h) => !results.meta.fields?.includes(h)
          );

          if (missingHeaders.length > 0) {
            errors.push(`Kolom wajib tidak ada: ${missingHeaders.join(", ")}. Pastikan Anda tidak menghapus kolom apapun dari template CSV yg diberikan.`);
            resolve({ valid: false, errors });
            return;
          }

          // Rows validation
          results.data.forEach((row: any, index: any) => {
            const rowNumber = index + 2;
            if (!row["ID Pengguna"]?.trim()) {
              errors.push(`Baris ${rowNumber}: Kolom 'ID Pengguna' wajib diisi`);
            }
            if (!row["ID Tempat"]?.trim()) {
              errors.push(`Baris ${rowNumber}: Kolom 'ID Tempat' wajib diisi`);
            }
            if (!row["Deskripsi Tiket"]?.trim()) {
              errors.push(`Baris ${rowNumber}: Kolom 'Deskripsi Tiket' wajib diisi`);
            }
          });
          resolve({ valid: errors.length === 0, errors });
        },
        error: (err: any) => {
          errors.push(`Gagal parsing CSV: ${err.message}`);
          resolve({ valid: false, errors });
        },
      });
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setOpenUploadDialog(false);
    setIsLoading(true);
    setLoadingMessage("Validasi file CSV...");

    const { valid, errors } = await validateCSV(selectedFile);
    if (!valid) {
      setApiResponse({
        status: 'error',
        title: 'Validasi CSV Gagal',
        description: 'Terdapat kesalahan dalam format file CSV:',
        errors: errors.map(msg => ({ message: msg }))
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setLoadingMessage("Mengunggah file CSV...");
    try {
      const token = localStorage.getItem(`${SLSS}`);
      const response = await fetch(`${BASE_URL2}/admin/tickets/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.log("Error response:", response);
        setUploading(false);
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal mengunggah tiket',
          description: 'Silakan coba lagi.',
        });
        return;
      }

      const data = await response.json();
      if (data.error) {
        setUploading(false);
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal mengunggah tiket',
          description: data.error,
        });
        return;
      }

      setSelectedFile(null);
      setUploading(false);
      setIsLoading(false);
      setApiResponse({
        status: 'success',
        title: 'Tiket berhasil diunggah',
        description: 'Tiket baru telah berhasil ditambahkan.',
      });
    } catch (error) {
      setUploading(false);
      setIsLoading(false);
      setApiResponse({
        status: 'error',
        title: 'Gagal mengunggah tiket',
        description: `Terjadi kesalahan ${error}. Silakan coba lagi.`,
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  // Handle download CSV
  const downloadCSV = async () => {
    if (filteredTickets.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    // Column Header CSV
    const headers = [
      "ID Tiket",
      "ID Perjalanan",
      "Deskripsi",
      "ID Tempat",
      "Nama Tempat",
      "ID Pengguna",
      "Nama Pengguna",
      "Status",
      "Diperbarui (WIB)",
      "Link PDF",
    ];

    // Table Data
    const rows = await Promise.all(
      filteredTickets.map(async (ticket) => {
        const geofence = geofences.find((g) => g.external_id === ticket.geofence_id)?.description;
        const user = users.find((u) => u.user_id === ticket.user_id);
        return [
          ticket.ticket_id,
          ticket.trip_id || "-",
          ticket.description,
          ticket.geofence_id || "-",
          geofence || "-",
          ticket.user_id || "-",
          user?.username || "-",
          ticket.status,
          new Date(ticket.updated_at).toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).replace(".", ":"),
          `${import.meta.env.VITE_abu_V2}/admin/tickets/pdf/${ticket.ticket_id}/${user?.user_id}/${ticket.geofence_id}`,
        ];
      })
    );

    // Combine headers and rows
    const csvContent =
      [headers.join(";"), ...rows.map((row) => row.map((value) => `"${value}"`).join(";"))].join("\n");

    //  Blob object to store CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Download CSV
    const link = document.createElement("a");
    link.href = url;
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
    link.setAttribute("download", `data-tiket-${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    setOpenAlertDialog(false);
    setIsLoading(true);
    setLoadingMessage("Membatalkan tiket...");

    try {
      const token = localStorage.getItem(import.meta.env.VITE_slss);
      const response = await fetch(`${BASE_URL2}/admin/tickets/status/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
        },
        body: JSON.stringify({ ticket_id: selectedTicket.ticket_id, status: "canceled" }),
      });

      if (!response.ok) {
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal membatalkan tiket',
          description: 'Silakan coba lagi.',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      setIsLoading(false);
      setApiResponse({
        status: 'success',
        title: 'Tiket berhasil dibatalkan',
        description: 'Tiket telah berhasil dibatalkan.',
      });
    } catch (error) {
      setIsLoading(false);
      setApiResponse({
        status: 'error',
        title: 'Gagal membatalkan tiket',
        description: `Terjadi kesalahan ${error}. Silakan coba lagi.`,
      });
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    setOpenDialog(false);
    setOpenInfoDialog(false);
    setIsLoading(true);
    setLoadingMessage("Menghapus tiket...");

    try {
      const token = localStorage.getItem(import.meta.env.VITE_slss);
      const response = await fetch(`${BASE_URL2}/admin/tickets/delete/${selectedTicket.ticket_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ? JSON.parse(token).access_token : ''}`,
        },
        body: JSON.stringify({ ticket_id: selectedTicket.ticket_id, status: "canceled" }),
      });

      if (!response.ok) {
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Gagal menghapus tiket',
          description: 'Silakan coba lagi.',
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['allTickets'] });
      setIsLoading(false);
      setApiResponse({
        status: 'success',
        title: 'Tiket berhasil dihapus',
        description: 'Tiket telah berhasil dihapus.',
      });
    } catch (error) {
      setIsLoading(false);
      setApiResponse({
        status: 'error',
        title: 'Gagal menghapus tiket',
        description: `Terjadi kesalahan ${error}. Silakan coba lagi.`,
      });
    }
  };

  if (error) return <div>Error loading tickets: {error.message}</div>;

  // function handleEditPhoto(url: any): void {
  //   console.log("Edit photo: ", url);
  //   throw new Error("Function not implemented.");
  // }

  function handleDeletePhoto(url: string): void {
    console.log(`Deleting photo: ${url}`);
  }

  // const filteredGeofences = geofences.filter((geofence) =>
  //   geofence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   geofence.external_id.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <>
      <div className="w-[85%] max-w-screen-xxl p-6">
        {/* Set Page Title */}
        <Helmet>
          <title>Tiket</title>
        </Helmet>

        <h1 className="mb-4 text-2xl font-semibold">Daftar Tiket</h1>

        <div className="flex items-center mb-4 space-x-4">
          {/* Add ticket button */}
          <Button onClick={() => handleAddOrUpdate(null)}>
            <TicketPlus className="inline" />
            Buat Tiket Baru
          </Button>

          {/* Upload CSV button */}
          <Button variant="secondary" onClick={() => setOpenUploadDialog(true)}>
            <Upload className="inline" />
            Unggah CSV
          </Button>

          {/* Download CSV Template */}
          <div>
            <a
              href={csvTicketsTemplate}
              download="template-tiket-baru.csv"
              className="text-blue-500 hover:underline"
            >
              Unduh Template Tiket CSV (.csv)
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
              <div>
                <p className="text-base">
                  File yang diunggah harus bertipe CSV dan mengikuti format sesuai template. <span className="font-bold">BACALAH PANDUAN</span> melalui tombol di bawah ini sebelum mengunggah file CSV.
                </p>
                <Button variant="default" onClick={() => window.open("https://drive.google.com/file/d/1G3D693z-4Oy_UYx4vIaUY-XytnOFW4bx/view?usp=sharing", "_blank")} className="mt-2 text-base">
                  <Info className="inline" size={12} />
                  Panduan Unggah CSV Data Tiket
                </Button>
              </div>
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
          <Input
            type="text"
            placeholder="Cari tiket..."
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
            </SelectContent>
          </Select>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium">Dari Tanggal:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="w-full p-2 border rounded"
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()} // Tidak bisa pilih tanggal di masa depan
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Sampai Tanggal:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="w-full p-2 border rounded"
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()} // Tidak bisa pilih tanggal di masa depan
              />
            </div>
          </div>

          {/* Download CSV button */}
          <Button onClick={downloadCSV} variant="secondary">
            <Download className="inline" />
            Unduh Data Tiket
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
            Menampilkan tiket: {filteredTickets.length}
          </p>
        </div>
        <div className='mb-2'>
          <p className="text-sm text-gray-500">
            Klik pada <span className='italic'>header</span> kolom untuk mengurutkan data.
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead onClick={() => handleSort("ticket_id")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("ticket_id")}
                  ID Tiket
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("trip_id")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("trip_id")}
                  ID Perjalanan
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("description")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("description")}
                  Deskripsi
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("geofence_id")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("geofence_id")}
                  Tempat
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("username")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("username")}
                  Pengguna
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("status")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("status")}
                  Status
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("updated_at")}>
                <div className='flex items-center gap-x-2'>
                  {getSortIcon("updated_at")}
                  Diperbarui (WIB)
                </div>
              </TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map(ticket => (
              <TableRow key={ticket.ticket_id}>
                <TableCell>{filteredTickets.indexOf(ticket) + 1}</TableCell>
                <TableCell>{ticket.ticket_id}</TableCell>
                <TableCell>{ticket.trip_id ? ticket.trip_id : "-"}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>
                  <div className="grid">
                    {ticket.geofence_id && geofences.find((geofence) => geofence.external_id === ticket.geofence_id)?.description}
                    <Badge variant="secondary">{ticket.geofence_id}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid">
                    {ticket.user_id && users.find((user) => user.user_id === ticket.user_id)?.username}
                    <Badge variant="secondary">{ticket.user_id}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === "arrived" || ticket.status === "completed"
                        ? "success"
                        : ticket.status === "pending" || ticket.status === "started" || ticket.status === "approaching" || ticket.status === "on_progress"
                          ? "warning"
                          : ticket.status === "expired"
                            ? "secondary"
                            : ticket.status === "assigned" ? "assigned" : "destructive"
                    }
                  >
                    {ticket.status === "assigned" && "Ditugaskan"}
                    {ticket.status === "started" && "Dimulai"}
                    {ticket.status === "on_progress" && "Berjalan"}
                    {ticket.status === "pending" && "Menunggu"}
                    {ticket.status === "approaching" && "Mendekati"}
                    {ticket.status === "arrived" && "Tiba"}
                    {ticket.status === "completed" && "Selesai"}
                    {ticket.status === "expired" && "Kadaluarsa"}
                    {ticket.status === "canceled" && "Dibatalkan"}
                  </Badge>
                </TableCell>
                {/* <TableCell>{new Date(ticket.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell> */}
                <TableCell>
                  {new Date(ticket.updated_at).toLocaleString('id-ID', {
                    timeZone: 'Asia/Jakarta',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).replace('.', ':')}
                </TableCell>
                <TableCell className="flex">
                  {(ticket.status !== "completed" && ticket.status !== "canceled" && ticket.status !== "on_progress") &&
                    <>
                      <Button
                        onClick={() => handleAddOrUpdate(ticket)}
                        variant="outline" className="mr-2">
                        <Pencil className="inline" />
                      </Button>
                      <Button
                        onClick={() => handleAlertDialog(ticket, "cancel")}
                        variant="destructive" className="mr-2"
                      >
                        <X className="inline" />
                      </Button>
                      <Button
                        onClick={() => handleAlertDialog(ticket, "delete")}
                        variant="destructive"
                      >
                        <Trash2Icon className="inline" />
                      </Button>
                    </>
                  }
                  {(ticket.status === "completed" || ticket.status === "canceled" || ticket.status === "on_progress") &&
                    <Button
                      onClick={() => handleInfo(ticket)}
                      variant="ghost"
                    >
                      <InfoIcon className="inline" />
                    </Button>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Dialog for adding or updating ticket */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="hidden" />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{selectedTicket ? "Edit Tiket" : "Pembuatan Tiket Baru"}</DialogTitle>
            <form className="space-y-4" onSubmit={selectedTicket ? handleUpdate : handleAdd}>
              <div>
                <label className="block text-sm font-medium">Pengguna</label>
                <Select onValueChange={(value) => handleFormChange("user_id", value)} value={formValues.user_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.username} <Badge variant="secondary">{user.user_id}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium">Geofence</label>
                <Select onValueChange={(value) => handleFormChange("geofence_id", value)} value={formValues.geofence_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tempat" />
                  </SelectTrigger>
                  <SelectContent>
                    {geofences.map((geofence) => (
                      <SelectItem key={geofence.id} value={geofence.external_id}>
                        {geofence.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                  value={formValues.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setOpenDialog(false)} variant="outline">
                  <X className="inline" /> Batal
                </Button>
                <Button type="submit">
                  <Save className="inline" /> Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for showing ticket detail / Modal Detail Ticket */}
        <Dialog open={openInfoDialog} onOpenChange={setOpenInfoDialog}>
          <DialogTrigger asChild>
            <Button className="hidden" />
          </DialogTrigger>
          {/* <DialogContent className="max-w-6xl"> */}
          <DialogContent className="max-w-[1600px]">
            <DialogTitle>Detail Tiket</DialogTitle>
            {/* <div className="grid grid-cols-3 gap-x-8"> */}
            <div className="grid grid-cols-4 gap-x-6">
              {tripInfo ? (
                <>
                  {/* Tiket */}
                  <div>
                    <h3 className="mb-4 font-medium">Tiket</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div>
                        <label className="block text-sm">ID Tiket</label>
                        <input
                          type="text"
                          value={selectedTicket?.ticket_id || "-"}
                          disabled
                          className="w-full px-4 py-2 whitespace-pre-line bg-gray-100 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Deskripsi</label>
                        <input
                          type="text"
                          value={selectedTicket?.description || "-"}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Dibuat pada (WIB)</label>
                        <DatePicker
                          selected={new Date(formValues.created_at)}
                          onChange={(date) => handleFormChange("created_at", date?.toISOString() || "")}
                          className="px-4 py-2 border rounded"
                          dateFormat="dd/MM/yyyy HH:mm"
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Diperbarui pada (WIB)</label>
                        <DatePicker
                          selected={new Date(formValues.updated_at)}
                          onChange={(date) => handleFormChange("updated_at", date?.toISOString() || "")}
                          className="w-full px-4 py-2 border rounded"
                          dateFormat="dd/MM/yyyy HH:mm"
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Status Tiket</label>
                        <Select
                          onValueChange={(value) => handleFormChange("status", value)}
                          value={formValues.status || selectedTicket?.status}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className={`w-full px-4 py-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}>
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assigned">
                              <Badge variant="assigned">Ditugaskan</Badge>
                            </SelectItem>
                            <SelectItem value="on_progress">
                              <Badge variant="warning">Berjalan</Badge>
                            </SelectItem>
                            <SelectItem value="completed">
                              <Badge variant="success">Selesai</Badge>
                            </SelectItem>
                            <SelectItem value="canceled">
                              <Badge variant="destructive">Dibatalkan</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Geofence */}
                  <div>
                    <h3 className="mb-4 font-medium">Tempat Tujuan</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div>
                        <label className="block text-sm">ID Tempat</label>
                        <input
                          type="text"
                          value={selectedTicket?.geofence_id || ""}
                          disabled
                          className="w-full px-4 py-2 whitespace-pre-line bg-gray-100 border rounded"
                        />
                        {/* <Select
                        onValueChange={(value) => handleFormChange("geofence_id", value)}
                        value={formValues.geofence_id || selectedTicket?.geofence_id}
                        // disabled={!isEditing}
                        disabled
                        onOpenChange={(open) => setIsSelectOpen(open)}
                      >
                        <SelectTrigger className={`w-full px-4 py-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}>
                          <SelectValue placeholder="Pilih Tempat" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2">
                            <Input
                              type="text"
                              placeholder="Cari tempat..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          {filteredGeofences.length > 0 ? (
                            filteredGeofences.map((geofence) => (
                              <SelectItem key={geofence.external_id} value={geofence.external_id}>
                                <Badge variant="secondary">{geofence.external_id}</Badge> {geofence.description}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500">Tidak ditemukan.</div>
                          )}
                        </SelectContent>
                      </Select> */}
                      </div>
                      <div>
                        <label className="block text-sm">Nama Tempat</label>
                        <input
                          type="text"
                          value={geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.description || "-"}
                          disabled
                          className={`w-full px-4 py-2 border rounded bg-gray-100`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm">Tag</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.tag || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Radius</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.radius || "-"} m
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Koordinat</label>
                        <div className="grid px-4 py-2 bg-gray-100 border rounded">
                          <span>{geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.coordinates[1] || "-"} (<span className="italic">Latitude</span>)</span>
                          <span>{geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.coordinates[0] || "-"} (<span className="italic">Longitude</span>)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Pengguna */}
                  <div>
                    <h3 className="mb-4 font-medium">Pengguna</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div>
                        <label className="block text-sm">ID Pengguna</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {selectedTicket?.user_id || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Nama Pengguna</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {users.find((user) => user.user_id === selectedTicket?.user_id)?.username || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Email</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {users.find((user) => user.user_id === selectedTicket?.user_id)?.email || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">No. HP</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {users.find((user) => user.user_id === selectedTicket?.user_id)?.phone || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Status Pengguna</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {users.find((user) => user.user_id === selectedTicket?.user_id) ? (users.find((user) => user.user_id === selectedTicket?.user_id)?.status === "active" ? "Aktif" : "Tidak Aktif") : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Perjalanan */}
                  <div>
                    <h3 className="mb-4 font-medium">Perjalanan</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                      <div>
                        <label className="block text-sm">ID Perjalanan</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {tripInfo.trip.externalId || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Dimulai pada (WIB)</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {new Date(tripInfo.trip.startedAt).toLocaleString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).replace('.', ':')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Diselesaikan pada (WIB)</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {new Date(tripInfo.trip.endedAt).toLocaleString('id-ID', {
                            timeZone: 'Asia/Jakarta',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).replace('.', ':')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Durasi</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {(() => {
                            // const trip = tripInfo.trip.externalId === selectedTicket?.trip_id;
                            if (!tripInfo || !tripInfo.trip.startedAt || !tripInfo.trip.endedAt) return "-";

                            const startedAt = new Date(tripInfo.trip.startedAt);
                            const endedAt = new Date(tripInfo.trip.endedAt);
                            const diffMs = endedAt.getTime() - startedAt.getTime();

                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                            const duration = [];
                            if (hours > 0) duration.push(`${hours} jam`);
                            if (minutes > 0) duration.push(`${minutes} menit`);
                            if (seconds > 0) duration.push(`${seconds} detik`);

                            return duration.length > 0 ? duration.join(" ") : "-";
                          })()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm">Status Perjalanan</label>
                        <p className="px-4 py-2 bg-gray-100 border rounded">
                          {tripInfo.trip.status === "assigned" && "Ditugaskan"}
                          {tripInfo.trip.status === "started" && "Dimulai"}
                          {tripInfo.trip.status === "pending" && "Menunggu"}
                          {tripInfo.trip.status === "approaching" && "Mendekati"}
                          {tripInfo.trip.status === "arrived" && "Tiba"}
                          {tripInfo.trip.status === "completed" && "Selesai"}
                          {tripInfo.trip.status === "expired" && "Kadaluarsa"}
                          {tripInfo.trip.status === "canceled" && "Dibatalkan"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Foto Tiket */}
                  <div className="col-span-4">
                    <h3 className="mt-4 mb-2 font-medium">Foto Tiket</h3>
                    <div className="flex gap-4">
                      {ticketPhotos.length > 0 ? (
                        ticketPhotos.map((photo, index) => (
                          <div key={index} className="relative overflow-hidden border rounded-lg">
                            <img
                              src={photo.url}
                              alt={`Foto ${index + 1}`}
                              className="object-cover h-32 cursor-pointer"
                              onClick={() => setSelectedImage(photo.url)} />
                            {isEditing && (
                              <div className="absolute top-0 right-0 p-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePhoto(photo.url)}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">Tidak ada foto yang tersedia.</p>
                      )}
                    </div>
                    {isEditing && ticketPhotos.length > 0 && (
                      <div className="mt-4">
                        <Button
                          variant="destructive"
                          onClick={() => ticketPhotos.forEach(photo => handleDeletePhoto(photo.url))}
                        >
                          <Trash2 className="inline" />
                          Hapus Semua Foto
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Tidak ada informasi perjalanan yang tersedia.</p>
              )}
            </div>
            {selectedImage ? (
              <Dialog open={selectedImage !== ""} onOpenChange={() => setSelectedImage("")}>
                {/* <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setSelectedImage(null)}>
                <img src={selectedImage} alt="Detail gambar" className="object-contain w-full h-full" />
              </div> */}
                <DialogTrigger asChild>
                  <Button className="hidden" />
                </DialogTrigger>
                <DialogContent>
                  <img src={selectedImage} alt="Foto Tiket" />
                </DialogContent>
              </Dialog>
            ) : null}

            <div className="flex justify-end mt-4 space-x-2">
              {selectedTicket && (
                <>
                  {!isEditing ? (
                    // Default mode (non-editing)
                    <>
                      <a
                        href={`${BASE_URL2}/admin/tickets/pdf/${selectedTicket.ticket_id}/${selectedTicket.user_id}/${selectedTicket.geofence_id}`}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-500 hover:underline gap-x-2"
                      >
                        <Download className="inline" size="16" />
                        Unduh PDF
                      </a>
                      {/* <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      <Pencil className="inline" />
                      Edit Tiket
                    </Button> */}
                      {selectedTicket.status !== "canceled" && (
                        <Button
                          onClick={() => handleAlertDialog(selectedTicket, "cancel")}
                          variant="destructive"
                        >
                          <X className="inline" />
                          Batalkan Tiket
                        </Button>
                      )}
                      <Button
                        onClick={() => handleAlertDialog(selectedTicket, "delete")}
                        variant="destructive"
                      >
                        <Trash2Icon className="inline" />
                        Hapus Tiket
                      </Button>
                    </>
                  ) : (
                    // Editing mode
                    <>
                      <div className="p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50">
                        {/* <div className="flex items-center mb-2">
                        <InfoIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Informasi</span>
                      </div> */}
                        {/* <Badge variant="warning">Berjalan</Badge> */}
                        <p>Jika terdapat kesalahan pemilihan Tempat atau Pengguna, maka pembuatan tiket harus diulangi dari awal.</p>
                      </div>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setFormValues({
                            user_id: selectedTicket.user_id,
                            geofence_id: selectedTicket.geofence_id,
                            description: selectedTicket.description || "",
                            status: selectedTicket.status,
                            created_at: selectedTicket.created_at,
                            updated_at: selectedTicket.updated_at,
                          });
                        }}
                        variant="outline"
                      >
                        <X className="inline" />
                        Batal
                      </Button>
                      <Button
                        onClick={() => handleUpdate()}
                        variant="default"
                      >
                        <Save className="inline" />
                        Simpan Perubahan
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog for delete confirmation */}
        <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
          <AlertDialogContent>
            <AlertDialogTitle>
              Apakah yakin ingin {alertAction === "delete" ? "menghapus" : "membatalkan"} tiket ini?<br />
              - {selectedTicket?.ticket_id}<br />
              - {selectedTicket?.geofence_id} - {geofences.find((geofence) => geofence.external_id === selectedTicket?.geofence_id)?.description}<br />
              - {selectedTicket?.description}
            </AlertDialogTitle>
            <div className="flex justify-end space-x-2">
              <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
                <X className="inline" />
                Tidak jadi
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={alertAction === "delete" ? handleDeleteTicket : handleCancelTicket}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="inline" />
                {alertAction === "delete" ? "Hapus" : "Batalkan"} Tiket
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div >
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
      {apiResponse.status !== 'idle' && (
        <ResponseStatus
          status={apiResponse.status}
          title={apiResponse.title || ''}
          description={apiResponse.description}
          errors={apiResponse.errors}
          onDismiss={() => setApiResponse({ status: 'idle' })}
        />
      )}
    </>
  );
}
