import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import { saveLocationToDatabase, getLatestLocationForEachUser } from "@/lib/actions";

export const Dashboard = () => {
  const [location, setLocation] = useState<any>(null);
  const [userLocations, setUserLocations] = useState<any[]>([]);
  const user = useUser();

  useEffect(() => {
    const fetchUserLocations = async () => {
      const locations = await getLatestLocationForEachUser();
      setUserLocations(locations);
    };

    fetchUserLocations();
  }, []);

  // Fetch current user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Call the action function to write data to DB
        if (user) {
          saveLocationToDatabase(user.id, user?.user_metadata.username, latitude, longitude);
        }
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
        {userLocations.map((userLocation) => (
          <Marker
            key={userLocation.user_id}
            position={[userLocation.latitude, userLocation.longitude]}
          >
            <Tooltip permanent direction="top" offset={[-15, -10]}>
              <div>
                <p>{userLocation.username}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
