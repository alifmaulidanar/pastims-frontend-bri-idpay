/* eslint-disable @typescript-eslint/no-explicit-any */
import "leaflet/dist/leaflet.css";
// import { v4 as uuidv4 } from 'uuid';
import { UserRadar as User } from "@/types";
import { useEffect, useState } from "react";
// import { Badge } from "@/components/ui/badge"
import "leaflet-geosearch/dist/geosearch.css";
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

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Daftar Tiket</h1>
    </div>
  );
}
