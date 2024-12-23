/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
// import { v4 as uuidv4 } from 'uuid';
// import { UserRadar as User } from "@/types";
import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
import { fetchTickets } from "./lib/actions";
import { Button } from "@/components/ui/button";
import { TicketPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { GeofenceRadar as Geofence } from "@/types";
// import { MapPinPlus, Pencil, Save, Trash2, X } from "lucide-react";
// import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
// import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Tickets() {
  // const [trips, setTrips] = useState<any[]>([]);
  // const [geofences, setGeofences] = useState<any[]>([]);
  // const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Disable body scroll when dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fetch trips
  // useEffect(() => {
  //   const fetchTrips = async () => {
  //     try {
  //       const response = await fetch("https://api.radar.io/v1/trips", {
  //         headers: {
  //           Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
  //         },
  //       });

  //       if (!response.ok) {
  //         console.error("Failed to fetch geofences");
  //         return;
  //       }

  //       const data = await response.json();
  //       setTrips(data.trips || []);
  //     } catch (error) {
  //       console.error("Failed to fetch geofences:", error);
  //     }
  //   };
  //   fetchTrips();
  // }, []);

  // Fetch tickets
  useEffect(() => {
    const getTickets = async () => {
      const fetchedTickets = await fetchTickets();
      setTickets(fetchedTickets);
    };
    getTickets();
  }, []);

  // Fetch geofences
  // useEffect(() => {
  //   const fetchGeofences = async () => {
  //     try {
  //       const response = await fetch("https://api.radar.io/v1/geofences", {
  //         headers: {
  //           Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
  //         },
  //       });

  //       if (!response.ok) {
  //         console.error("Failed to fetch geofences");
  //         return;
  //       }

  //       const data = await response.json();
  //       setGeofences(data.geofences || []);
  //     } catch (error) {
  //       console.error("Failed to fetch geofences:", error);
  //     }
  //   };
  //   fetchGeofences();
  // }, []);

  // Fetch users
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch("https://api.radar.io/v1/users", {
  //         headers: {
  //           Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
  //         },
  //       });

  //       if (!response.ok) {
  //         console.error("Failed to fetch users");
  //         return;
  //       }

  //       const data = await response.json();
  //       setUsers(data.users || []);
  //     } catch (error) {
  //       console.error("Failed to fetch users:", error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);

  // yg akan masuk ke table trips di supabase:
  // - radar_id: _id -> radar id trips
  //   - external_id: externalId -> eksternal id trips
  //     - user_id: userId -> user id FK dari auth.users
  //       - geofence_id: destinationGeofenceExternalId -> geofence id FK dari geofences
  //         - geofence_tag: destinationGeofenceTag -> geofence tag trips
  //           - live: live -> live trips(default: false)
  //             - mode: mode -> mode trips(default: bike)
  //               - status: status -> status trips(default: pending)
  //                 - approaching_Threshold: approachingThreshold -> approaching threshold trips(default: 1)
  //                   - locations[]: locations -> array of location trips

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Daftar Tiket</h1>

      <Button
        className="mb-4"
      // onClick={() => handleAddOrUpdate(null)}
      >
        <TicketPlus className="inline" />
        Buat Tiket Baru
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Tiket</TableHead>
            <TableHead>ID Perjalanan</TableHead>
            <TableHead>ID Tempat</TableHead>
            <TableHead>ID Pengguna</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat pada</TableHead>
            <TableHead>Diperbarui pada</TableHead>
            {/* <TableHead>Aksi</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map(ticket => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.ticket_id}</TableCell>
              <TableCell>{ticket.trip_id ? ticket.trip_id : "-"}</TableCell>
              <TableCell>{ticket.geofence_id}</TableCell>
              <TableCell>{ticket.user_id}</TableCell>
              <TableCell>{ticket.description}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{new Date(ticket.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell>
              <TableCell>{new Date(ticket.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell>
              {/* <TableCell>
                <Button onClick={() => handleAddOrUpdate(user)} variant="outline" className="mr-2">
                  <Pencil className="inline" />
                </Button>
                <Button onClick={() => handleAlertDialog(user)} variant="destructive">
                  <Trash2 className="inline" />
                </Button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
