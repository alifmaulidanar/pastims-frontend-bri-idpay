/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async";
import TotalPie from "@/components/customs/charts/totalPie";
import TotalCard from "@/components/customs/charts/totalCard";
import { getGeofencesCounts, getTicketsCounts, getTripsCounts, getUsersCounts } from "@/lib/dashboard";
import { useState, useEffect, useRef } from "react";
import { LineInteractiveChart } from "@/components/customs/charts/line-interactive";
import { RecentDataTable } from "@/components/customs/charts/recent-data-table";
import { LoadingOverlay } from "@/components/customs/loading-state";
// import GeocodingButton from "@/components/customs/reverseGeocoding";
// import GeofenceUploader from "@/components/customs/cityGeofenceUploader";
// import CityProvinceUploader from "@/components/customs/cityProvinceGeofenceUploader";

export default function Dashboard() {
  const [userData, setUserData] = useState<{ browser: string; pengguna: number; fill: string }[]>([]);
  const [geofenceData, setGeofenceData] = useState<{ browser: string; merchant: number; fill: string }[]>([]);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [tripData, setTripData] = useState<any[]>([]);
  const [timeRangeTicket, setTimeRangeTicket] = useState("90d")
  const [timeRangeTrip, setTimeRangeTrip] = useState("90d")
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Prevent scrolling on the body
  useEffect(() => {
    document.body.style.overflowX = "hidden"; // Prevent horizontal scrolling only
    return () => {
      document.body.style.overflowX = "auto"; // Restore horizontal scrolling when component unmounts
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsDataLoading(true);
        const { userCount, clientCount } = await getUsersCounts();
        const geofenceCounts = await getGeofencesCounts();
        setUserData([
          { browser: "user", pengguna: userCount, fill: "var(--color-user)" },
          { browser: "client", pengguna: clientCount, fill: "var(--color-client)" },
        ]);
        setGeofenceData(geofenceCounts.map((item, index) => ({
          // browser: item.province,
          browser: item.city,
          merchant: item.count,
          fill: `hsl(${(index * 60) % 360}, 85%, 45%)`
        })));
        setIsDataLoading(false);
      } catch (error) {
        console.error("Error fetching user counts:", error);
        setIsDataLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsDataLoading(true);
      const ticketCounts = await getTicketsCounts(timeRangeTicket)
      const tripCounts = await getTripsCounts(timeRangeTrip)
      setTicketData(ticketCounts);
      setTripData(tripCounts);
      setIsDataLoading(false);
    }
    fetchData()
  }, [timeRangeTicket, timeRangeTrip]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isDataLoading) {
      setLoadingMessage("Memuat data...");
      setIsLoading(true);
    }

    if (!isDataLoading && isMounted.current) {
      setIsLoading(false);
    }
  }, [isDataLoading]);

  return (
    <div className="w-full">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <h1 className="mb-4 text-xl font-semibold md:text-2xl">Dashboard</h1>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Kolom Kiri */}
        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <TotalPie parameter="Pengguna" data={userData} valueKey="pengguna" nameKey="browser" />
            <TotalPie parameter="Lokasi Merchant" data={geofenceData} valueKey="merchant" nameKey="browser" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TotalCard parameter="Tiket" value={ticketData.length} />
            <TotalCard parameter="Perjalanan" value={tripData.length} />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="xl:col-span-2">
          <RecentDataTable />
        </div>
      </div>

      {/* Line Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LineInteractiveChart
          data={ticketData}
          title="Distribusi Status Tiket"
          timeRange={timeRangeTicket}
          onTimeRangeChange={setTimeRangeTicket}
        />
        <LineInteractiveChart
          data={tripData}
          title="Distribusi Status Perjalanan"
          timeRange={timeRangeTrip}
          onTimeRangeChange={setTimeRangeTrip}
        />
      </div>

      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
    </div>
  );
}
