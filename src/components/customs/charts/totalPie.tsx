/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { MapPinCheck, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TotalPieProps {
  parameter: string;
  data: { [key: string]: any }[];
  valueKey: string;
  nameKey: string;
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

export default function TotalPie({ parameter, data, valueKey, nameKey }: TotalPieProps) {
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr[valueKey], 0);
  }, [data, valueKey]);

  const dynamicChartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
      const key = item[nameKey];
      config[key] = {
        label: item[nameKey],
        color: chartColors[index % chartColors.length],
      };
    });
    return config;
  }, [data, nameKey]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="text-xl">
        <div className="flex flex-row justify-between text-xl">
          <CardTitle>Total {parameter}</CardTitle>
          {parameter === "Pengguna" ? (
            <User2 className="w-6 h-6 text-muted-foreground" />
          ) : (
            <MapPinCheck className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={dynamicChartConfig}
          className="mx-auto aspect-square max-h-[200px] md:max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data} dataKey={valueKey} nameKey={nameKey}
              innerRadius={70}
              // outerRadius={120}
              strokeWidth={5}
              paddingAngle={2}
              isAnimationActive={true} >
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
            {/* {parameter === "Pengguna" && (
              <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} className="flex flex-wrap gap-2 [&>*]:basis-1/8 [&>*]:justify-center text-sm" />
            )} */}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
