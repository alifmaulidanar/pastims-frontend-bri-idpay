import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import clientIconUrl from "../../assets/marker-icons/admin/pin-map.png";
import { UserRadar as User, GeofenceRadar as Geofence, Ticket } from "@/types";
import motorIconUrl from "../../assets/marker-icons/motorcycle/motorcycle.png";
import geofenceIconUrl from "../../assets/marker-icons/geofences/geofences.png";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";

type MapViewProps = {
  location: { lat: number; lng: number };
  tileLayer: string;
  userLocations: User[];
  geofences: Geofence[];
  tickets: Ticket[];
  onMapLoad?: () => void;
}

const clientIcon = L.icon({
  iconUrl: clientIconUrl,
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

const MapView = ({ location, tileLayer, userLocations, geofences, tickets, onMapLoad }: MapViewProps) => {
  const [userAddresses, setUserAddresses] = useState<Record<string, string>>({});
  const [geofenceAddress, setGeofenceAddress] = useState<Record<string, string>>({});

  useEffect(() => {
    if (onMapLoad) {
      onMapLoad();
    }
  }, [onMapLoad]);

  const fetchAddressFromLatLng = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      return data.display_name || "-";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };


  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      {/* Default Tile layer */}
      <TileLayer
        url={tileLayer}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Current user's location */}
      {location && (
        <Marker position={[location.lat, location.lng]} icon={clientIcon}>
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
      {(userLocations ?? []).map((user) => {
        const [longitude, latitude] = user.location.coordinates;
        const handleUserClick = async () => {
          if (!userAddresses[user._id]) {
            const address = await fetchAddressFromLatLng(latitude, longitude);
            setUserAddresses((prev) => ({ ...prev, [user._id]: address }));
          }
        };

        return (
          <Marker key={user._id} position={[latitude, longitude]} icon={motorIcon}>
            <Popup eventHandlers={{ add: handleUserClick }}>
              <div>
                <Badge variant="outline">{user.userId}</Badge>

                {/* User Table */}
                <table className="user-info-table">
                  <tbody>
                    <tr>
                      <td><strong>Nama</strong></td>
                      <td>:</td>
                      <td>{user.metadata.username || "Unknown User"}</td>
                    </tr>
                    <tr>
                      <td><strong>Email</strong></td>
                      <td>:</td>
                      <td>{user.metadata.email}</td>
                    </tr>
                    <tr>
                      <td><strong>No. HP</strong></td>
                      <td>:</td>
                      <td>{user.metadata.phone}</td>
                    </tr>
                    <tr>
                      <td><strong>Latitude</strong></td>
                      <td>:</td>
                      <td>{user.location.coordinates[1]}</td>
                    </tr>
                    <tr>
                      <td><strong>Longitude</strong></td>
                      <td>:</td>
                      <td>{user.location.coordinates[0]}</td>
                    </tr>
                    <tr>
                      <td><strong>Alamat</strong></td>
                      <td>:</td>
                      <td>{userAddresses[user._id] || "Memuat..."}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ticket Table */}
              <table className="my-4 ticket-card">
                <tbody>
                  {tickets
                    .filter((ticket) => ticket.user_id === user.userId)
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .slice(0, 1)
                    .map((ticket) => (
                      <>
                        <tr key={ticket.id} className="ticket-card-content">
                          <td><strong>ID Tiket</strong></td>
                          <td>:</td>
                          <td><Badge variant="outline">{ticket.ticket_id}</Badge></td>
                        </tr>
                        <tr>
                          <td><strong>Deskripsi</strong></td>
                          <td>:</td>
                          <td>{ticket.description}</td>
                        </tr>
                        <tr>
                          <td><strong>Tempat</strong></td>
                          <td>:</td>
                          <td>{geofences.find((geofence) => geofence.externalId === ticket.geofence_id)?.description || "Unknown location"}</td>
                        </tr>
                        <tr>
                          <td><strong>Status</strong></td>
                          <td>:</td>
                          <td>
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
                          </td>
                        </tr>
                        {/* waktu terakhir */}
                        <tr>
                          <td><strong>Waktu</strong></td>
                          <td>:</td>
                          <td>
                            {new Date(ticket.updated_at).toLocaleString("id-ID", { weekday: "long" })}, {new Date(ticket.updated_at).toLocaleString("en-GB", { timeZone: "Asia/Jakarta", hour12: false })} WIB
                          </td>
                        </tr>
                      </>
                    ))}
                </tbody>
              </table>
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
        const handleGeofenceClick = async () => {
          if (!geofenceAddress[geofence._id]) {
            const address = await fetchAddressFromLatLng(latitude, longitude);
            setGeofenceAddress((prev) => ({ ...prev, [geofence._id]: address }));
          }
        };

        return (
          <Marker key={geofence._id} position={[latitude, longitude]} icon={geofenceIcon}>
            <Popup eventHandlers={{ add: handleGeofenceClick }}>
              <div>
                <div className="flex gap-x-2">
                  <Badge variant="outline">{geofence.externalId}</Badge>
                  <Badge variant="secondary">{geofence.tag}</Badge>
                </div>

                {/* Geofence Table */}
                <table className="mt-4 geofence-info-table">
                  <tbody>
                    <tr>
                      <td><strong>Tempat</strong></td>
                      <td>:</td>
                      <td>{geofence.description || "Unknown location"}</td>
                    </tr>
                    <tr>
                      <td><strong>Latitude</strong></td>
                      <td>:</td>
                      <td>{geofence.geometryCenter.coordinates[1]}</td>
                    </tr>
                    <tr>
                      <td><strong>Longitude</strong></td>
                      <td>:</td>
                      <td>{geofence.geometryCenter.coordinates[0]}</td>
                    </tr>
                    <tr>
                      <td><strong>Alamat</strong></td>
                      <td>:</td>
                      <td>{geofenceAddress[geofence._id] || "Memuat..."}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]}>
              <span>{geofence.description || geofence.externalId}</span>
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  );
};

export default MapView;
