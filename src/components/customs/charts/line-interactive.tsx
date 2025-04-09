/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LineInteractiveChartProps {
  data: any[]
  title: string
  timeRange: string
  onTimeRangeChange: (value: string) => void
}

const timeRangeOptions = [
  { label: "1 Bulan", value: "30d" },
  { label: "2 Bulan", value: "60d" },
  { label: "3 Bulan", value: "90d" },
]

const processData = (rawData: any[], range: string) => {
  const endDate = new Date()
  const startDate = new Date()

  switch (range) {
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '60d':
      startDate.setDate(startDate.getDate() - 60)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    case 'custom':
      // Implementasi date picker disini
      break
  }

  // Filter data dalam rentang
  const filteredData = rawData.filter(item => {
    const itemDate = new Date(item.updated_at)
    return itemDate >= startDate && itemDate <= endDate
  })

  // Generate semua tanggal dalam rentang
  const dateMap = new Map<string, any>()
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0]
    dateMap.set(dateKey, {
      date: dateKey,
      assigned: 0,
      on_progress: 0,
      completed: 0,
      canceled: 0
    })
  }

  // Isi data aktual
  filteredData.forEach(item => {
    const dateKey = new Date(item.updated_at).toISOString().split('T')[0]
    if (dateMap.has(dateKey)) {
      dateMap.get(dateKey)[item.status] += 1
    }
  })

  return Array.from(dateMap.values()).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

const chartConfig = {
  assigned: {
    label: "Ditugaskan",
    color: "hsl(var(--chart-1))",
  },
  on_progress: {
    label: "Berjalan",
    color: "hsl(var(--chart-2))",
  },
  completed: {
    label: "Selesai",
    color: "hsl(var(--chart-3))",
  },
  canceled: {
    label: "Dibatalkan",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function LineInteractiveChart({
  data,
  title,
  timeRange,
  onTimeRangeChange
}: LineInteractiveChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("assigned")

  const processedData = React.useMemo(
    () => processData(data, timeRange),
    [data, timeRange]
  )

  // Hitung total
  const totals = React.useMemo(() => ({
    assigned: processedData.reduce((sum, d) => sum + d.assigned, 0),
    on_progress: processedData.reduce((sum, d) => sum + d.on_progress, 0),
    completed: processedData.reduce((sum, d) => sum + d.completed, 0),
    canceled: processedData.reduce((sum, d) => sum + d.canceled, 0)
  }), [processedData])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch p-0 space-y-0 border-b sm:flex-row">
        <div className="flex flex-col justify-center flex-1 gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Data {timeRange == "30d" ? "1 bulan" : timeRange == "60d" ? "2 bulan" : timeRange == "90d" ? "3 bulan" : "1 bulan"} terakhir
          </CardDescription>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih rentang" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap">
          {Object.keys(chartConfig).map((key) => {
            const chartKey = key as keyof typeof chartConfig
            return (
              <button
                key={chartKey}
                data-active={activeChart === chartKey}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chartKey)}
              >
                <Badge
                  className="text-xs"
                  variant={
                    chartConfig[chartKey].label === "Ditugaskan"
                      ? "assigned"
                      : chartConfig[chartKey].label === "Berjalan"
                        ? "warning"
                        : chartConfig[chartKey].label === "Selesai"
                          ? "success"
                          : "destructive"
                  }
                >
                  {chartConfig[chartKey].label}
                </Badge>
                {/* <span className="text-xs">
                  Klik untuk melihat grafik
                </span> */}
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {totals[chartKey].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] sm:h-[250px]"
        >
          <LineChart
            data={processedData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey={activeChart}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // minTickGap={32}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={chartConfig[activeChart].label}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={activeChart === "assigned" ? "blue" : activeChart === "on_progress" ? "orange" : activeChart === "completed" ? "green" : "red"}
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}