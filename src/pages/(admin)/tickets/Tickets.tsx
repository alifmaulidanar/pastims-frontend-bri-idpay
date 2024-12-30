/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
import { Ticket, User } from "@/types";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { fetchTickets } from "./lib/actions";
import { Badge } from "@/components/ui/badge";
import "leaflet-geosearch/dist/geosearch.css";
import { Button } from "@/components/ui/button";
import { fetchUsers } from "../users/lib/actions";
import { InfoIcon, Pencil, Save, TicketPlus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Tickets() {
  const [trips, setTrips] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openInfoDialog, setOpenInfoDialog] = useState<boolean>(false);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [formValues, setFormValues] = useState({ user_id: "", geofence_id: "", description: "" });

  // Disable body scroll when dialog is open
  // useEffect(() => {
  //   document.body.style.overflow = "hidden";
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, []);

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

  // Fetch tickets
  useEffect(() => {
    const getTickets = async () => {
      const fetchedTickets = await fetchTickets();
      setTickets(fetchedTickets);
    };
    getTickets();
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
    const getUsers = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    getUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log({ formValues });
    try {
      const response = await fetch(`${BASE_URL}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        console.error("Failed to add ticket");
        return;
      }

      const newTicket = await response.json();
      setTickets((prevTickets) => [...prevTickets, newTicket]);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    console.log({ selectedTicket });
    console.log({ formValues });

    const ticketData = {
      ticket_id: selectedTicket.ticket_id,
      ...formValues,
    };

    console.log({ ticketData });

    try {
      const response = await fetch(`${BASE_URL}/ticket`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        console.error("Failed to update ticket");
        return;
      }

      const updatedTicket = await response.json();
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => (ticket.ticket_id === updatedTicket.ticket_id ? updatedTicket : ticket))
      );
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleAddOrUpdate = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setFormValues({
      user_id: ticket?.user_id || "",
      geofence_id: ticket?.geofence_id || "",
      description: ticket?.description || "",
    });
    setOpenDialog(true);
  };

  const handleInfo = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setFormValues({
      user_id: ticket?.user_id || "",
      geofence_id: ticket?.geofence_id || "",
      description: ticket?.description || "",
    });
    setOpenInfoDialog(true);
  };

  const handleAlertDialog = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setOpenAlertDialog(true)
  };

  const handleFormChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      {/* Set Page Title */}
      <Helmet>
        <title>Tiket</title>
      </Helmet>

      <h1 className="mb-4 text-2xl font-semibold">Daftar Tiket</h1>

      <Button className="mb-4" onClick={() => handleAddOrUpdate(null)}>
        <TicketPlus className="inline" />
        Buat Tiket Baru
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Tiket</TableHead>
            <TableHead>ID Perjalanan</TableHead>
            <TableHead>Tempat</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Status</TableHead>
            {/* <TableHead>Dibuat pada</TableHead> */}
            <TableHead>Diperbarui pada</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map(ticket => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.trip_id ? ticket.trip_id : "-"}</TableCell>
              <TableCell>
                <div className="grid">
                  {ticket.geofence_id && geofences.find((geofence) => geofence.externalId === ticket.geofence_id)?.description}
                  <Badge variant="secondary">{ticket.geofence_id}</Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="grid">
                  {ticket.user_id && users.find((user) => user.user_id === ticket.user_id)?.username}
                  <Badge variant="secondary">{ticket.user_id}</Badge>
                </div>
              </TableCell>
              <TableCell>{ticket.description}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    ticket.status === "arrived" || ticket.status === "completed"
                      ? "success"
                      : ticket.status === "pending" || ticket.status === "started" || ticket.status === "approaching"
                        ? "warning"
                        : ticket.status === "expired"
                          ? "secondary"
                          : ticket.status === "assigned" ? "assigned" : "destructive"
                  }
                >
                  {ticket.status === "assigned" && "Ditugaskan"}
                  {ticket.status === "started" && "Dimulai"}
                  {ticket.status === "pending" && "Menunggu"}
                  {ticket.status === "approaching" && "Mendekati"}
                  {ticket.status === "arrived" && "Tiba"}
                  {ticket.status === "completed" && "Selesai"}
                  {ticket.status === "expired" && "Kadaluarsa"}
                  {ticket.status === "canceled" && "Dibatalkan"}
                </Badge>
              </TableCell>
              {/* <TableCell>{new Date(ticket.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell> */}
              <TableCell>{new Date(ticket.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell>
              <TableCell className="flex">
                {(ticket.status !== "completed" && ticket.status !== "canceled") &&
                  <>
                    <Button
                      onClick={() => handleAddOrUpdate(ticket)}
                      variant="outline" className="mr-2">
                      <Pencil className="inline" />
                    </Button>
                    <Button
                      onClick={() => handleAlertDialog(ticket)}
                      variant="destructive"
                    >
                      <X className="inline" />
                    </Button>
                  </>
                }
                {(ticket.status === "completed" || ticket.status === "canceled") &&
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

      {/* Dialog for adding or updating user */}
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
                    <SelectItem key={geofence._id} value={geofence.externalId}>
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

      {/* Dialog for showing ticket detail */}
      <Dialog open={openInfoDialog} onOpenChange={setOpenInfoDialog}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        {/* <DialogContent className="max-w-6xl"> */}
        <DialogContent className="max-w-[1600px]">
          <DialogTitle>Detail Tiket</DialogTitle>
          {/* <div className="grid grid-cols-3 gap-x-8"> */}
          <div className="grid grid-cols-4 gap-x-6">
            {/* Tiket */}
            <div>
              <h3 className="mb-4 font-medium">Tiket</h3>
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <label className="block text-sm">ID Tiket</label>
                  <p className="px-4 py-2 whitespace-pre-line bg-gray-100 border rounded">
                    {selectedTicket?.ticket_id || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Deskripsi</label>
                  <p className="px-4 py-2 whitespace-pre-line bg-gray-100 border rounded">
                    {selectedTicket?.description || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Dibuat pada</label>
                  <p className="px-4 py-2 whitespace-pre-line bg-gray-100 border rounded">
                    {new Date(selectedTicket?.created_at ?? '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Diperbarui pada</label>
                  <p className="px-4 py-2 whitespace-pre-line bg-gray-100 border rounded">
                    {new Date(selectedTicket?.updated_at ?? '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Status Tiket</label>
                  <p className="px-4 py-2 whitespace-pre-line bg-gray-100 border rounded">
                    {selectedTicket?.status === "assigned" && "Ditugaskan"}
                    {selectedTicket?.status === "started" && "Dimulai"}
                    {selectedTicket?.status === "pending" && "Menunggu"}
                    {selectedTicket?.status === "approaching" && "Mendekati"}
                    {selectedTicket?.status === "arrived" && "Tiba"}
                    {selectedTicket?.status === "completed" && "Selesai"}
                    {selectedTicket?.status === "expired" && "Kadaluarsa"}
                    {selectedTicket?.status === "canceled" && "Dibatalkan"}
                  </p>
                </div>
              </div>
            </div>

            {/* Geofence */}
            <div>
              <h3 className="mb-4 font-medium">Tempat</h3>
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <label className="block text-sm">ID Tempat</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {selectedTicket?.geofence_id || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Nama Tempat</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {geofences.find((geofence) => geofence.externalId === selectedTicket?.geofence_id)?.description || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Tag</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {geofences.find((geofence) => geofence.externalId === selectedTicket?.geofence_id)?.tag || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Radius</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {geofences.find((geofence) => geofence.externalId === selectedTicket?.geofence_id)?.geometryRadius || "-"} m
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Koordinat</label>
                  <div className="grid px-4 py-2 bg-gray-100 border rounded">
                    <span>{geofences.find((geofence) => geofence.externalId === selectedTicket?.geofence_id)?.geometryCenter.coordinates[1] || "-"} (<span className="italic">Latitude</span>)</span>
                    <span>{geofences.find((geofence) => geofence.externalId === selectedTicket?.geofence_id)?.geometryCenter.coordinates[0] || "-"} (<span className="italic">Longitude</span>)</span>
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
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.externalId || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Dimulai pada</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {new Date(trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.startedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Diselesaikan pada</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {new Date(trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.endedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
                  </p>
                </div>
                <div>
                  <label className="block text-sm">Durasi</label>
                  <p className="px-4 py-2 bg-gray-100 border rounded">
                    {(() => {
                      const trip = trips.find((trip) => trip.externalId === selectedTicket?.trip_id);
                      if (!trip || !trip.startedAt || !trip.endedAt) return "-";

                      const startedAt = new Date(trip.startedAt);
                      const endedAt = new Date(trip.endedAt);
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
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "assigned" && "Ditugaskan"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "started" && "Dimulai"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "pending" && "Menunggu"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "approaching" && "Mendekati"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "arrived" && "Tiba"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "completed" && "Selesai"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "expired" && "Kadaluarsa"}
                    {trips.find((trip) => trip.externalId === selectedTicket?.trip_id)?.status === "canceled" && "Dibatalkan"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Alert Dialog for delete confirmation */}
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Apakah yakin ingin membatalkan tiket ini?</AlertDialogTitle>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
              <X className="inline" />
              Tidak jadi
            </AlertDialogCancel>
            <AlertDialogAction
            // onClick={() => handleDelete()}
            >
              <Trash2 className="inline" />
              Ya, batalkan tiket
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
