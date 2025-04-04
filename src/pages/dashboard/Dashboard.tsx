/* eslint-disable @typescript-eslint/no-explicit-any */
import { Helmet } from "react-helmet-async";
// import AreaInteractiveChart from "@/components/customs/charts/area-interactive";
import TotalPie from "@/components/customs/charts/totalPie";
import TotalCard from "@/components/customs/charts/totalCard";
import { getGeofencesCounts, getTicketsCounts, getTripsCounts, getUsersCounts } from "@/lib/dashboard";
import { useState, useEffect } from "react";
import { LineInteractiveChart } from "@/components/customs/charts/line-interactive";
import { RecentDataTable } from "@/components/customs/charts/recent-data-table";
// import GeocodingButton from "@/components/customs/reverseGeocoding";
// import GeofenceUploader from "@/components/customs/cityGeofenceUploader";

export default function Dashboard() {
  const [userData, setUserData] = useState<{ browser: string; pengguna: number; fill: string }[]>([]);
  const [geofenceData, setGeofenceData] = useState<{ browser: string; city: string; tempat: number; fill: string }[]>([]);
  const [ticketData, setTicketData] = useState<any[]>([]);
  const [tripData, setTripData] = useState<any[]>([]);
  const [timeRangeTicket, setTimeRangeTicket] = useState("90d")
  const [timeRangeTrip, setTimeRangeTrip] = useState("90d")
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { userCount, clientCount } = await getUsersCounts();
        const geofenceCounts = await getGeofencesCounts();
        setUserData([
          { browser: "user", pengguna: userCount, fill: "var(--color-user)" },
          { browser: "client", pengguna: clientCount, fill: "var(--color-client)" },
        ]);
        setGeofenceData(geofenceCounts.map(item => ({
          browser: item.city,
          city: item.city,
          tempat: item.count,
          fill: `hsl(${Math.random() * 360}, 70%, 50%)`
        })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user counts:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const ticketCounts = await getTicketsCounts(timeRangeTicket)
      const tripCounts = await getTripsCounts(timeRangeTrip)
      setTicketData(ticketCounts);
      setTripData(tripCounts);
    }
    fetchData()
  }, [timeRangeTicket, timeRangeTrip]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>

      {/* <GeocodingButton /> */}
      {/* <GeofenceUploader /> */}

      <div className="grid grid-cols-4 mb-8 gap-x-8">
        <div className="grid col-span-1 gap-y-8">
          <TotalPie parameter="Pengguna" data={userData} valueKey="pengguna" nameKey="browser" />
          <TotalCard parameter="Tiket" value={ticketData.length} />
        </div>
        <div className="grid col-span-1 gap-y-8">
          <TotalPie parameter="Tempat" data={geofenceData} valueKey="tempat" nameKey="city" />
          <TotalCard parameter="Perjalanan" value={tripData.length} />
        </div>
        <div className="col-span-2">
          <RecentDataTable />
        </div>
      </div>

      <div className="grid grid-cols-2 mb-8 gap-x-8">
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
    </div>
  );
}
