import * as React from "react";
import { Pie, PieChart } from "recharts";
import { getTicketsCounts } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  assigned: "Ditugaskan",
  on_progress: "Berjalan",
  completed: "Selesai",
  canceled: "Dibatalkan",
};
const STATUS_COLORS: Record<string, string> = {
  assigned: "#0074D9",      // Biru terang
  on_progress: "#FF851B",   // Oranye terang
  completed: "#2ECC40",     // Hijau terang
  canceled: "#FF4136",      // Merah terang
};

export default function TicketStatusPieChart({ month, setMonth, year, months }: { month: number; setMonth: (m: number) => void; year: number; months: string[] }) {
  type Ticket = { status: string; updated_at: string };
  const [data, setData] = React.useState<Ticket[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const result = await getTicketsCounts("31d");
      setData(
        result.filter((t: Ticket & { created_at?: string }) => {
          const d = new Date(t.created_at ?? t.updated_at);
          return d.getMonth() + 1 === month && d.getFullYear() === year;
        })
      );
    }
    fetchData();
  }, [month, year]);

  const statusCounts = data.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status] || status,
    jumlah: statusCounts[status] || 0,
    fill: STATUS_COLORS[status],
  }));

  const chartConfig: ChartConfig = {
    jumlah: { label: "Jumlah" },
    assigned: {
      label: STATUS_LABELS.assigned,
      color: STATUS_COLORS.assigned,
    },
    on_progress: {
      label: STATUS_LABELS.on_progress,
      color: STATUS_COLORS.on_progress,
    },
    completed: {
      label: STATUS_LABELS.completed,
      color: STATUS_COLORS.completed,
    },
    canceled: {
      label: STATUS_LABELS.canceled,
      color: STATUS_COLORS.canceled,
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0 text-xl">
        <div className="flex items-center justify-between w-full">
          <CardTitle>Status Tiket Bulan Ini</CardTitle>
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue>{months[month - 1]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {months.map((m, idx) => (
                <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] md:max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="jumlah"
              nameKey="label"
              label
              labelLine
              isAnimationActive={false}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
