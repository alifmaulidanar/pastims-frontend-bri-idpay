import { useState } from "react";
import Radar from "radar-sdk-js";
import { RadarTravelMode } from "radar-sdk-js/dist/types";

const Emergency = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    ticket_id: "",
    description: "",
    geofence_id: "",
    geofence_tag: "",
    photos: [] as File[], // Perubahan: multiple files
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input perubahan
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle multiple file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        photos: e.target.files ? Array.from(e.target.files) : [], // Perubahan: Konversi FileList ke array
      }));
    }
  };

  // Function to generate unique ID with prefix and timestamp in GMT+7 timezone and 3 random digits
  function generateId(prefix: string): string {
    // Get current epoch time in GMT+7 timezone
    const epochGmt7 = Date.now() + (7 * 3600000);

    // Generate 3 digit random number
    const randomSuffix = Math.floor(100 + Math.random() * 900);

    // Combine prefix, epoch time, and random number
    return `${prefix}${epochGmt7}${randomSuffix}`;
  }

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const tripExternalId = generateId("PJ");
      console.log("Generated trip external ID:", tripExternalId);

      // Jika berhasil, jalankan Radar.startTrip di frontend
      interface TripData {
        userId: string;
        externalId: string;
        mode: RadarTravelMode;
        destinationGeofenceTag: string;
        destinationGeofenceExternalId: string;
        approachingThreshold: number;
        startTracking: boolean;
        metadata: {
          ticketId: string;
          ticketDescription: string;
          geofenceId: string;
          geofenceTag: string;
          userId: string;
          username: string;
        };
      }

      const defaultTripOptions: TripData = {
        userId: formData.user_id,
        externalId: tripExternalId,
        mode: 'bike',
        destinationGeofenceTag: formData.geofence_tag,
        destinationGeofenceExternalId: formData.geofence_id,
        approachingThreshold: 1,
        startTracking: true,
        metadata: {
          ticketId: formData.ticket_id,
          ticketDescription: formData.description,
          geofenceId: formData.geofence_id,
          geofenceTag: formData.geofence_tag,
          userId: formData.user_id,
          username: formData.username,
        },
      };

      console.log("Starting trip with Radar...", defaultTripOptions);
      await Radar.startTrip(defaultTripOptions);
      console.log("Trip started!");

      // // Selesaikan trip
      console.log("Completing trip...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Jeda 5 detik
      await Radar.completeTrip();
      console.log("Trip completed!");
      setMessage("Ticket uploaded and trip started successfully!");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message || "An unexpected error occurred");
      } else {
        setMessage("An unexpected error occurred");
      }
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold">Emergency Ticket Upload</h2>

      {message && <p className="mb-4 text-center text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="user_id"
          placeholder="User ID"
          value={formData.user_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="ticket_id"
          placeholder="Ticket ID"
          value={formData.ticket_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="geofence_id"
          placeholder="Geofence ID"
          value={formData.geofence_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="geofence_tag"
          placeholder="Geofence Tag"
          value={formData.geofence_tag}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple // Perubahan: Izinkan multiple file
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-500 rounded"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
};

export default Emergency;
