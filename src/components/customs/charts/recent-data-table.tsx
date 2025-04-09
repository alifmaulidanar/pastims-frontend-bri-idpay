/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { getRecentTickets } from "@/lib/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { BadgeInfo, Ban, CheckCheck, Loader, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentDataTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-tickets'],
    queryFn: getRecentTickets,
  })

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-destructive">
          Error: {error.message}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-row justify-between text-xl">
          <CardTitle>Data Tiket dan Perjalanan Terkini</CardTitle>
          <BadgeInfo className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardDescription>Menampilkan {isLoading ? '...' : data?.length} data terbaru</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ScrollArea className="h-[400px] md:h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>ID Tiket</TableHead>
                {/* <TableHead>ID Perjalanan</TableHead> */}
                <TableHead>Tempat Tujuan</TableHead>
                <TableHead>Nama Pengguna</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <TableCell key={j} className="font-mono truncate max-w-[120px] md:max-w-none">
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                data?.slice(0, 10).map((item, index) => (
                  <TableRow key={item.ticket_id}>
                    <TableCell className="font-mono truncate max-w-[120px] md:max-w-none">{index + 1}</TableCell>
                    <TableCell className="font-mono truncate max-w-[120px] md:max-w-none">{item.ticket_id}</TableCell>
                    {/* <TableCell className="font-mono truncate max-w-[120px] md:max-w-none">{item.trip_id}</TableCell> */}
                    <TableCell className="font-mono max-w-[120px] md:max-w-none">
                      {((item as any).geofences?.description || '-').length > 15
                        ? `${((item as any).geofences?.description || '-').substring(0, 15)}...`
                        : ((item as any).geofences?.description || '-')}
                    </TableCell>                    <TableCell className="font-mono max-w-[120px] md:max-w-none">{(item as any).users?.username || '-'}</TableCell>
                    <TableCell className="font-mono max-w-[120px] md:max-w-none">{item.description || '-'}</TableCell>
                    <TableCell className="font-mono truncate max-w-[120px] md:max-w-none">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant={
                                item.status === "arrived" || item.status === "completed"
                                  ? "success"
                                  : item.status === "pending" || item.status === "started" || item.status === "approaching" || item.status === "on_progress"
                                    ? "warning"
                                    : item.status === "expired"
                                      ? "secondary"
                                      : item.status === "assigned" ? "assigned" : "destructive"
                              }
                            >
                              {item.status === "assigned" && <Loader className="w-4 h-4 animate-spin" />}
                              {item.status === "started" && <Loader className="w-4 h-4 animate-spin" />}
                              {item.status === "on_progress" && <Loader className="w-4 h-4 animate-spin" />}
                              {item.status === "pending" && <Loader className="w-4 h-4 animate-spin" />}
                              {item.status === "approaching" && <Loader className="w-4 h-4 animate-spin" />}
                              {item.status === "arrived" && <CheckCheck className="w-4 h-4" />}
                              {item.status === "completed" && <CheckCheck className="w-4 h-4" />}
                              {item.status === "canceled" && <X className="w-4 h-4 animate-pulse" />}
                              {item.status === "expired" && <Ban className="w-4 h-4" />}
                              {/* {item.status === "assigned" && "Tugas"}
                              {item.status === "started" && "Berjalan"}
                              {item.status === "on_progress" && "Berjalan"}
                              {item.status === "pending" && "Berjalan"}
                              {item.status === "approaching" && "Berjalan"}
                              {item.status === "arrived" && "Berjalan"}
                              {item.status === "completed" && "Selesai"}
                              {item.status === "expired" && "Kadaluarsa"}
                              {item.status === "canceled" && "Batal"} */}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {item.status === "assigned" && "Ditugaskan"}
                            {item.status === "started" && "Berjalan"}
                            {item.status === "on_progress" && "Berjalan"}
                            {item.status === "pending" && "Berjalan"}
                            {item.status === "approaching" && "Berjalan"}
                            {item.status === "arrived" && "Berjalan"}
                            {item.status === "completed" && "Selesai"}
                            {item.status === "expired" && "Kadaluarsa"}
                            {item.status === "canceled" && "Dibatalkan"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="font-mono max-w-[120px] md:max-w-none">
                      {format(new Date(item.updated_at), "dd/MM/yyyy HH:mm", { locale: id })}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
      {/* <CardFooter className="px-6 pb-6">
        <div className="flex items-start w-full gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              <InfoIcon className="w-4 h-4" />
              <span>Total data: {isLoading ? '...' : data?.length}</span>
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              <ClockIcon className="w-4 h-4" />
              <span>Update terakhir: {format(new Date(), "dd MMM yyyy HH:mm", { locale: id })}</span>
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  )
}

// Add icons for visual indicators
// function InfoIcon(props: any) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <path d="M12 16v-4" />
//       <path d="M12 8h.01" />
//     </svg>
//   )
// }

// function ClockIcon(props: any) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <polyline points="12 6 12 12 16 14" />
//     </svg>
//   )
// }