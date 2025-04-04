/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AreaInteractiveChartProps {
  data: any[];
  type?: string;
}

const chartConfig = {
  assigned: {
    label: "Assigned",
    color: "hsl(var(--chart-1))",
  },
  on_progress: {
    label: "On Progress",
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-3))",
  },
  canceled: {
    label: "Canceled",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function AreaInteractiveChart({ data, type }: AreaInteractiveChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = data.filter((item) => {
    const date = new Date(item.updated_at);
    const referenceDate = new Date();
    let daysToSubtract = 90;

    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "60d") daysToSubtract = 60;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  // Proses data untuk chart
  const chartData: any[] = [];
  filteredData.forEach((item: any) => {
    const itemDate = new Date(item.updated_at).toISOString().split('T')[0]; // Ambil tanggal saja

    const existingEntry = chartData.find((d) => d.date === itemDate);

    if (existingEntry) {
      existingEntry[item.status] = (existingEntry[item.status] || 0) + 1;
    } else {
      chartData.push({
        date: itemDate,
        assigned: item.status === 'assigned' ? 1 : 0,
        on_progress: item.status === 'on_progress' ? 1 : 0,
        completed: item.status === 'completed' ? 1 : 0,
        canceled: item.status === 'canceled' ? 1 : 0,
      });
    }
  });

  // Urutkan data berdasarkan tanggal
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 py-5 space-y-0 border-b sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>Showing total tickets and trips for the selected time range</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
            <SelectItem value="60d" className="rounded-lg">Last 2 months</SelectItem>
            <SelectItem value="30d" className="rounded-lg">Last 1 month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="assigned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="blue" stopOpacity={0.8} />
                <stop offset="95%" stopColor="blue" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="on_progress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="yellow" stopOpacity={0.8} />
                <stop offset="95%" stopColor="yellow" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="green" stopOpacity={0.8} />
                <stop offset="95%" stopColor="green" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="canceled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="red" stopOpacity={0.8} />
                <stop offset="95%" stopColor="red" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            {type === "ticket" ? (
              <YAxis
                dataKey="assigned"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.toString()}
              />
            ) : (
              <YAxis
                dataKey="completed"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.toString()}
              />
            )}
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit'
                })
              }
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent hideLabel />} />
            <Area
              dataKey="canceled"
              fill="url(#canceled)"
              stroke="red"
              stackId="1"
            />
            <Area
              dataKey="on_progress"
              fill="url(#on_progress)"
              stroke="yellow"
              stackId="1"
            />
            <Area
              dataKey="assigned"
              fill="url(#assigned)"
              stroke="blue"
              stackId="1"
            />
            <Area
              dataKey="completed"
              fill="url(#completed)"
              stroke="green"
              stackId="1"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}