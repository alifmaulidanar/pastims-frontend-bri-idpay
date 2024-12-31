/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import { UserRadar as User, GeofenceRadar as Geofence } from "@/types";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define custom icons
import adminIconUrl from "../../assets/marker-icons/admin/pin-map.png";
import motorIconUrl from "../../assets/marker-icons/motorcycle/motorcycle.png";
import geofenceIconUrl from "../../assets/marker-icons/geofences/geofences.png";

const Dashboard = () => {
  const user = useUser();
  const mapRef = useRef<any>(null);
  const [userLocations, setUserLocations] = useState<User[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [tileLayer, setTileLayer] = useState<string>("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

  // Create custom icons
  const adminIcon = L.icon({
    iconUrl: adminIconUrl,
    iconSize: [44, 44],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const motorIcon = L.icon({
    iconUrl: motorIconUrl,
    iconSize: [44, 44],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const geofenceIcon = L.icon({
    iconUrl: geofenceIconUrl,
    iconSize: [36, 36],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Prevent scrolling on the body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  // Fetch all geofences
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await fetch("https://api.radar.io/v1/geofences", {
          headers: {
            Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to fetch geofences:", errorData.message);
          return;
        }

        const data = await response.json();
        setGeofences(data.geofences);

        if (geofences) {
          geofences.forEach(async (geofence: any) => {
            const latitude = geofence.geometryCenter.coordinates[1];
            const longitude = geofence.geometryCenter.coordinates[0];
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            return response.json();
          });
        }
      } catch (error) {
        console.error("Error fetching geofences:", error);
      }
    };
    fetchGeofences();
  }, []);

  // Fetch locations of all users
  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        const response = await fetch("https://api.radar.io/v1/users", {
          headers: {
            Authorization: import.meta.env.VITE_RADAR_TEST_SECRET_KEY,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to fetch user locations:", errorData.message);
          return;
        }

        const data = await response.json();
        const uniqueUsers = data.users.reduce((acc: Record<string, User>, user: User) => {
          const existingUser = user.userId ? acc[user.userId] : undefined;
          if (!existingUser || new Date(user.updatedAt) > new Date(existingUser.updatedAt)) {
            if (user.userId) {
              acc[user.userId] = user;
            }
          }
          return acc;
        }, {});
        setUserLocations(Object.values(uniqueUsers));

        // setUserLocations(data.users);

        if (userLocations) {
          userLocations.forEach(async (user: any) => {
            const latitude = user.location.coordinates[1];
            const longitude = user.location.coordinates[0];
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            return response.json();
          });
        }
      } catch (error) {
        console.error("Error fetching user locations:", error);
      }
    };
    fetchUserLocations();
  }, []);

  // Handle tile layer change
  const handleTileLayerChange = (layer: string) => {
    setTileLayer(layer);
  };

  // Render the map
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

        {/* buatlah sebuah legenda untuk map */}
        <div className="flex space-x-4">
          <div className="flex flex-col items-center justify-center">
            <img src={adminIconUrl} alt="Admin" className="w-6 h-6" />
            <p className="text-sm">Admin</p>
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
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          {/* Default Tile layer */}
          <TileLayer url={tileLayer} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />

          {/* Current user's location */}
          {location && (
            <Marker position={[location.lat, location.lng]} icon={adminIcon}>
              <Popup>
                <div>
                  <h3>Lokasi Anda:</h3>
                  <p>Latitude: {location.lat}</p>
                  <p>Longitude: {location.lng}</p>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -20]} permanent>
                <span>Anda</span>
              </Tooltip>
            </Marker>
          )}

          {/* Other users' locations */}
          {userLocations.map((user) => {
            const [longitude, latitude] = user.location.coordinates;
            return (
              <Marker key={user._id} position={[latitude, longitude]} icon={motorIcon}>
                <Popup>
                  <div>
                    <Badge variant="outline">{user.userId}</Badge>
                    <p>Nama: {user.metadata.username || "Unknown User"}</p>
                    <p>Email: {user.metadata.email}</p>
                    <p>No. HP: {user.metadata.phone}</p>
                    <p>Latitude: {user.location.coordinates[1]}</p>
                    <p>Longitude: {user.location.coordinates[0]}</p>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -20]} permanent>
                  <span>{user.metadata.username || "Unknown User"}</span>
                </Tooltip>
              </Marker>
            )
          })}

          {/* Geofences locations */}
          {geofences.map((geofence) => {
            const [longitude, latitude] = geofence.geometryCenter.coordinates;
            return (
              <Marker key={geofence._id} position={[latitude, longitude]} icon={geofenceIcon}>
                <Popup>
                  <div>
                    <Badge variant="outline">{geofence.externalId}</Badge>
                    <p>{geofence.description || "Unknown geofence"} <Badge variant="secondary">{geofence.tag}</Badge></p>
                    <p>Latitude: {geofence.geometryCenter.coordinates[1]}</p>
                    <p>Longitude: {geofence.geometryCenter.coordinates[0]}</p>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -20]}>
                  <span>{geofence.description || geofence.externalId}</span>
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </>
  );
};

export default Dashboard;
