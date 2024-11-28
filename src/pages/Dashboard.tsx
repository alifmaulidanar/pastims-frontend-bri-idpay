import L from "leaflet";
import "leaflet/dist/leaflet.css";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<any>(null);
  const user = useUser();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch current user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        supabase
          .from("locations")
          .upsert({
            user_id: user?.id,
            latitude,
            longitude,
          })
          .then((res) => {
            if (res.error) {
              console.error("Error updating location:", res.error.message);
            }
          });
      }, (error) => {
        console.error("Geolocation error:", error);
      }, { enableHighAccuracy: true, maximumAge: 10000 });
    }
  }, [user]);

  if (!location) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]}>
          <Popup>Your current location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Dashboard;
