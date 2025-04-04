import { Ticket, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TotalCardProps {
  parameter: string;
  value: number;
  desc?: string;
}

export default function TotalCard({ parameter, value }: TotalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row justify-between text-xl">
            <span>Total {parameter}</span>
            {parameter === "Tiket" ? (
              <Ticket className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Truck className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </CardTitle>
        {/* <CardDescription>
          Menampilkan perkembangan _parameter_ selama 6 bulan terakhir
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center my-auto text-5xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
      {/* <CardFooter>
        <div className="flex items-start w-full gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}
