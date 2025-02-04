import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BadgeHelp, InfoIcon } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_abu;
const BASE_URL2 = import.meta.env.VITE_abu_V2;

const Emergency = () => {
  // Disable body scroll when dialog is open
  // useEffect(() => {
  //   document.body.style.overflowX = "hidden";
  //   document.body.style.overflowY = "auto";

  //   return () => {
  //     document.body.style.overflowX = "";
  //     document.body.style.overflowY = "";
  //   };
  // }, []);

  const [fixFormData, setFixFormData] = useState({
    user_id: "",
    ticket_id: "",
    trip_id: "",
    photos: [] as File[], // Multiple files
  });

  const [startFormData, setStartFormData] = useState({
    user_id: "",
    username: "",
    ticket_id: "",
    description: "",
    geofence_id: "",
    geofence_tag: "",
    photos: [] as File[], // Multiple files
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFixChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFixFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStartFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFixFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFixFormData((prev) => ({
        ...prev,
        photos: e.target.files ? Array.from(e.target.files) : [],
      }));
    }
  };

  const handleStartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStartFormData((prev) => ({
        ...prev,
        photos: e.target.files ? Array.from(e.target.files) : [],
      }));
    }
  };

  // Function to generate unique ID with prefix and timestamp in GMT+7 timezone and 3 random digits
  function generateId(prefix: string): string {
    const epochGmt7 = Date.now() + (7 * 3600000);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${prefix}${epochGmt7}${randomSuffix}`;
  }

  const handleSubmitFix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("user_id", fixFormData.user_id);
      formData.append("ticket_id", fixFormData.ticket_id);
      formData.append("trip_id", fixFormData.trip_id);
      fixFormData.photos.forEach((file) => {
        formData.append(`photos[]`, file);
      });

      const response = await fetch(`${BASE_URL2}/api/emergency/0193f4a3/fix/ticket`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbaiki tiket.");
      }

      console.log("Fix Ticket Data:", result);
      setMessage("Tiket berhasil diperbaiki!");
      setFixFormData({
        user_id: "",
        ticket_id: "",
        trip_id: "",
        photos: [],
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Generate Trip External ID
      const tripExternalId = generateId("PJ");
      console.log("Trip External ID:", tripExternalId);

      // 2. Backend API Call
      const formData = new FormData();
      formData.append("user_id", startFormData.user_id);
      formData.append("username", startFormData.username);
      formData.append("ticket_id", startFormData.ticket_id);
      formData.append("trip_id", tripExternalId)
      formData.append("description", startFormData.description);
      formData.append("geofence_id", startFormData.geofence_id);
      formData.append("geofence_tag", startFormData.geofence_tag);
      startFormData.photos.forEach((file) => {
        formData.append(`photos[]`, file);
      });

      const response = await fetch(`${BASE_URL2}/api/emergency/0193f4a3/upload/ticket`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbaiki tiket.");
      }

      setMessage("Ticket uploaded and trip started successfully!");
      setStartFormData({
        user_id: "",
        username: "",
        ticket_id: "",
        description: "",
        geofence_id: "",
        geofence_tag: "",
        photos: [],
      });
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
    <div className="flex justify-center mt-4 -ml-60 gap-x-20">

      {/* Fix Ticket Only */}
      <div className="max-w-xl p-4 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-bold text-center">Perbaikan Tiket Tersangkut</h2>

        {/* Information */}
        <div className="p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center mb-2">
            <InfoIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">Kapan harus menggunakan formulir ini?</span>
          </div>
          <ul className="text-left list-disc list-inside">
            <li>Ketika tiket sudah dimulai Pengguna, tetapi tidak bisa diselesaikan dari APK (tersangkut)</li>
            <li>Ketika tiket sudah diselesaikan Pengguna, tetapi foto gagal terunggah dari APK (foto tertinggal)</li>
            <li>Ketika tiket sudah diselesaikan Pengguna dan foto sudah diunggah, tetapi status tiket atau status perjalanan belum "Selesai"</li>
          </ul>
        </div>

        <div className="p-4 mb-4 text-sm text-orange-800 border border-orange-300 rounded-lg bg-orange-50">
          <div className="flex items-center mb-2">
            <BadgeHelp className="w-5 h-5 mr-2" />
            <span className="font-medium">Memerlukan data input:</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left list-disc list-inside">
            <div>
              <li>ID Pengguna</li>
              <li>ID Tiket</li>
            </div>
            <div>
              <li>ID Perjalanan</li>
              <li>Unggah 4 Foto (opsional)</li>
            </div>
          </div>
        </div>

        {message && <p className="my-4 text-center text-green-500">{message}</p>}
        {/* <p className="mb-4 text-center text-green-500">Ticket uploaded and trip started successfully!</p> */}

        <form onSubmit={handleSubmitFix} className="mt-4 space-y-4 text-sm">
          <input
            type="text"
            name="user_id"
            placeholder="ID Pengguna"
            value={fixFormData.user_id}
            onChange={handleFixChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="ticket_id"
            placeholder="ID Ticket"
            value={fixFormData.ticket_id}
            onChange={handleFixChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="trip_id"
            placeholder="ID Perjalanan"
            value={fixFormData.trip_id}
            onChange={handleFixChange}
            className="w-full p-2 border rounded"
            required
          />

          <p>Unggah Foto Bukti Tiket (Opsional):</p>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple // multiple files
            onChange={handleFixFileChange}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Perbaiki Tiket"}
          </button>
        </form>
      </div>

      {/* Start, Stop, and Upload Ticket Form */}
      <div className="max-w-xl p-4 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-bold text-center">Menjalankan Tiket Baru</h2>

        {/* Information */}
        <div className="p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center mb-2">
            <InfoIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">Kapan harus menggunakan formulir ini?</span>
          </div>
          <ul className="text-left list-disc list-inside">
            <li>Ketika tiket sudah dibuat oleh Admin, tetapi belum dijalankan oleh Pengguna</li>
            <li>Tiket lama yang belum dikerjakan (waktu akan otomatis terisi waktu saat ini)</li>
          </ul>
        </div>

        <div className="p-4 mb-4 text-sm text-orange-800 border border-orange-300 rounded-lg bg-orange-50">
          <div className="flex items-center mb-2">
            <BadgeHelp className="w-5 h-5 mr-2" />
            <span className="font-medium">Memerlukan data input:</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-left list-disc list-inside">
            <div>
              <li>ID Pengguna</li>
              <li>Nama Pengguna</li>
              <li>ID Tiket</li>
            </div>
            <div>
              <li>Deskripsi</li>
              <li>ID Tempat</li>
            </div>
            <div>
              <li>Tag Tempat</li>
              <li>Unggah 4 Foto (WAJIB)</li>
            </div>
          </div>
        </div>

        <div>
          <p className="text-justify"></p>
        </div>

        {message && <p className="mb-4 text-center text-green-500">{message}</p>}
        {/* <p className="mb-4 text-center text-green-500">Ticket uploaded and trip started successfully!</p> */}

        <form onSubmit={handleSubmitStart} className="space-y-4 text-sm">
          <input
            type="text"
            name="user_id"
            placeholder="ID Pengguna"
            value={startFormData.user_id}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Nama Pengguna"
            value={startFormData.username}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="ticket_id"
            placeholder="ID Tiket"
            value={startFormData.ticket_id}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Deskripsi"
            value={startFormData.description}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="geofence_id"
            placeholder="ID Tempat"
            value={startFormData.geofence_id}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="geofence_tag"
            placeholder="Tag Tempat"
            value={startFormData.geofence_tag}
            onChange={handleStartChange}
            className="w-full p-2 border rounded"
            required
          />

          <p>Unggah Foto Bukti Tiket <Badge variant="destructive">(WAJIB)</Badge>:</p>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple // multiple files
            onChange={handleStartFileChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full p-2 text-white bg-blue-500 rounded"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Mulai Tiket"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Emergency;
