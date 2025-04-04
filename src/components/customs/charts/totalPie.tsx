/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MapPinCheck, User2 } from "lucide-react";

interface TotalPieProps {
  parameter: string;
  data: { [key: string]: any }[];
  valueKey: string;
  nameKey: string;
}

const chartConfig: ChartConfig = {
  pengguna: {
    label: "Pengguna",
  },
  user: {
    label: "User",
    color: "hsl(var(--chart-2))",
  },
  client: {
    label: "Client",
    color: "hsl(var(--chart-4))",
  },
  geofence: {
    label: "Tempat",
    color: "hsl(var(--chart-1))",
  },
};

export default function TotalPie({ parameter, data, valueKey, nameKey }: TotalPieProps) {
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr[valueKey], 0);
  }, [data, valueKey]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="text-xl">
        <div className="flex flex-row justify-between text-xl">
          <CardTitle>Total {parameter} Aktif</CardTitle>
          {parameter === "Pengguna" ? (
            <User2 className="w-6 h-6 text-muted-foreground" />
          ) : (
            <MapPinCheck className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={70} outerRadius={120} strokeWidth={5} paddingAngle={2} isAnimationActive={true} >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="text-3xl font-bold fill-foreground">
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          {parameter}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            {/* <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" /> */}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
