/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
// import { v4 as uuidv4 } from 'uuid';
import { Ticket, User } from "@/types";
import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { fetchTickets } from "./lib/actions";
import { Button } from "@/components/ui/button";
import { Pencil, Save, TicketPlus, Trash2, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchUsers } from "../users/lib/actions";
import { Badge } from "@/components/ui/badge";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Tickets() {
  const [trips, setTrips] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
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

  const handleAlertDialog = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    setOpenAlertDialog(true)
  };

  const handleFormChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
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
              <TableCell>{ticket.status}</TableCell>
              {/* <TableCell>{new Date(ticket.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell> */}
              <TableCell>{new Date(ticket.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell>
              <TableCell className="flex">
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

            {/* <div>
              <label className="block text-sm font-medium">Perjalanan (Opsional)</label>
              <Select onValueChange={(value) => handleFormChange("trip_id", value)} value={formValues.trip_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Perjalanan" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip._id} value={trip.externalId}>
                      {trip.externalId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

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
    </div>
  );
}
