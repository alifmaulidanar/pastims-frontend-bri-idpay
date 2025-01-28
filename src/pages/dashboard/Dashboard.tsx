/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserRadar } from "@/types";
import { fetchMaps } from "@/lib/maps";
import { useMap } from "react-leaflet";
import { Helmet } from "react-helmet-async";
import { useQuery } from '@tanstack/react-query';
import { useUser } from "@supabase/auth-helpers-react";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define custom icons
import clientIconUrl from "../../assets/marker-icons/admin/pin-map.png";
import motorIconUrl from "../../assets/marker-icons/motorcycle/motorcycle.png";
import geofenceIconUrl from "../../assets/marker-icons/geofences/geofences.png";

const MapView = lazy(() => import("../../components/customs/map-view")); // Lazy load MapView

const Dashboard = () => {
  const user = useUser();
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tileLayer, setTileLayer] = useState<string>("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

  // Prevent scrolling on the body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fetch all map data (users, geofences, tickets)
  const { data: mapsData, isLoading, error } = useQuery({
    queryKey: ['maps'],
    queryFn: fetchMaps,
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  // Extract data from mapsData
  const geofences = mapsData?.geofences ?? [];
  const tickets = mapsData?.tickets ?? [];
  const uniqueUsers = useMemo(() => {
    if (!mapsData?.users) return [];
    return mapsData.users.reduce((acc: Record<string, UserRadar>, user: UserRadar) => {
      const existingUser = user.userId ? acc[user.userId] : undefined;
      if (!existingUser || new Date(user.updatedAt) > new Date(existingUser.updatedAt)) {
        if (user.userId) {
          acc[user.userId] = user;
        }
      }
      return acc;
    }, {});
  }, [mapsData?.users]);

  const userLocations = useMemo(() => Object.values(uniqueUsers), [uniqueUsers]);

  // Add geocoder control to the map
  useEffect(() => {
    if (mapRef.current) {
      const map = useMap();
      L.Control.Geocoder.nominatim().addTo(map);
    }
  }, []);

  // Fetch current user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
      }, (error) => {
        console.error("Geolocation error:", error);
      }, { enableHighAccuracy: true, maximumAge: 10000 });
    }
  }, [user]);

  // Handle tile layer change
  const handleTileLayerChange = (layer: string) => {
    setTileLayer(layer);
  };

  // Render the map
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!location) return <div>Loading...</div>;

  return (
    <>
      {/* Set Page Title */}
      <Helmet>
        <title>Peta Lokasi</title>
      </Helmet>

      {/* Tile layer themes dropdown */}
      < div className="z-50 flex justify-between w-[85%] p-4 bg-white rounded-md shadow-lg" >
        <h1 className="text-2xl font-semibold">Peta Lokasi</h1>

        {/* Map Legends */}
        <div className="flex space-x-4">
          <div className="flex flex-col items-center justify-center">
            <img src={clientIconUrl} alt="Admin" className="w-6 h-6" />
            <p className="text-sm">Anda</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={motorIconUrl} alt="Pengguna" className="w-6 h-6" />
            <p className="text-sm">Pengguna</p>
          </div>
          <div className="flex flex-col items-center">
            <img src={geofenceIconUrl} alt="Tempat" className="w-6 h-6" />
            <p className="text-sm">Tempat</p>
          </div>
        </div>

        <Select onValueChange={handleTileLayerChange} defaultValue="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih Tema Map" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png">OpenStreetMap - Default (Color)</SelectItem>
            <SelectItem value="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}">Esri World Street Map (Color)</SelectItem>
            <SelectItem value="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}">Esri Light Gray Canvas (Light)</SelectItem>
            <SelectItem value="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png">CartoDB Voyager (Color)</SelectItem>
            <SelectItem value="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png">CartoDB Positron (Light)</SelectItem>
            <SelectItem value="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png">CartoDB (Dark)</SelectItem>
            <SelectItem value="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png">Stadia Maps Alidade Smooth (Light)</SelectItem>
            <SelectItem value="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png">Stadia Maps (Dark)</SelectItem>
          </SelectContent>
        </Select>
      </div >

      {/* Maps */}
      <div className="absolute z-0 w-full h-full">
        <Suspense fallback={<div>Loading Map...</div>}>
          {!mapRef.current ? (
            <MapView
              location={location as { lat: number; lng: number }}
              tileLayer={tileLayer}
              userLocations={userLocations ?? []}
              geofences={geofences ?? []}
              tickets={tickets ?? []}
              onMapLoad={() => {
                mapRef.current = true;
              }}
            />
          ) : (
            <MapView
              location={location as { lat: number; lng: number }}
              tileLayer={tileLayer}
              userLocations={userLocations ?? []}
              geofences={geofences ?? []}
              tickets={tickets ?? []}
            />
          )}
        </Suspense>
      </div>
    </>
  );
};

export default Dashboard;
