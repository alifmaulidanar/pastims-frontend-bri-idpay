/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecentTickets } from "@/lib/dashboard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeInfo } from "lucide-react"

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>ID Tiket</TableHead>
              <TableHead>ID Perjalanan</TableHead>
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
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              data?.slice(0, 5).map((item, index) => (
                <TableRow key={item.ticket_id}>
                  <TableCell className="font-mono">{index + 1}</TableCell>
                  <TableCell className="font-mono">{item.ticket_id}</TableCell>
                  <TableCell className="font-mono">{item.trip_id}</TableCell>
                  <TableCell className="font-mono">{(item as any).geofences?.description || '-'}</TableCell>
                  <TableCell className="font-mono">{(item as any).users?.username || '-'}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                  <TableCell>
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
                      {item.status === "assigned" && "Ditugaskan"}
                      {item.status === "started" && "Dimulai"}
                      {item.status === "on_progress" && "Berjalan"}
                      {item.status === "pending" && "Menunggu"}
                      {item.status === "approaching" && "Mendekati"}
                      {item.status === "arrived" && "Tiba"}
                      {item.status === "completed" && "Selesai"}
                      {item.status === "expired" && "Kadaluarsa"}
                      {item.status === "canceled" && "Dibatalkan"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.updated_at), "dd MMM yyyy HH:mm", { locale: id })}
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