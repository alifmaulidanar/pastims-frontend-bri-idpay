/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UserRadar as User } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import "leaflet-control-geocoder/dist/Control.Geocoder.js";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

// Define custom icons
import adminIconUrl from "../../assets/marker-icons/admin/pin-map.png";
import motorIconUrl from "../../assets/marker-icons/motorcycle/motorcycle.png";

const Dashboard = () => {
  const user = useUser();
  const mapRef = useRef<any>(null);
  const [userLocations, setUserLocations] = useState<User[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
        setUserLocations(data.users);

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

  // Render the map
  if (!location) return <div>Loading...</div>;

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Current user's location */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={adminIcon}>
            <Popup>
              <div>
                <h3>Your Location</h3>
                <p>Latitude: {location.lat}</p>
                <p>Longitude: {location.lng}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Other users' locations */}
        {userLocations.map((user) => {
          const [longitude, latitude] = user.location.coordinates;
          return (
            <Marker key={user._id} position={[latitude, longitude]} icon={motorIcon}>
              <Popup>
                <div>
                  <h3>{user.description || "Unknown User"}</h3>
                  <p>Latitude: {user.location.coordinates[1]}</p>
                  <p>Longitude: {user.location.coordinates[0]}</p>
                  <p>Metadata: {JSON.stringify(user.metadata)}</p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
