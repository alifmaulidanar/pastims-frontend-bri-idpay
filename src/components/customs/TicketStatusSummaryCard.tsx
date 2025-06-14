import { useState } from "react";
import { Badge } from "../ui/badge";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";

const STATUS_LABELS: Record<string, string> = {
  assigned: "Ditugaskan",
  on_progress: "Berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};
const STATUS_COLORS: Record<string, string> = {
  assigned: "#0074D9",
  on_progress: "#FF851B",
  completed: "#2ECC40",
  cancelled: "#FF4136",
};

type Ticket = {
  ticket_id: string;
  user_id: string;
  users: { username: string };
  geofence_id: string;
  geofences: { description: string };
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  tickets: Ticket[];
  month: number;
  setMonth: (m: number) => void;
  year: number;
  months: string[];
};

export default function TicketStatusSummaryCard({ tickets, month, setMonth, year, months }: Props) {
  const [openStatus, setOpenStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredByMonth = tickets.filter((t) => {
    const d = new Date(t.updated_at);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const statusCounts = Object.keys(STATUS_LABELS).reduce(
    (acc, status) => {
      acc[status] = filteredByMonth.filter((t) => t.status === status).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const filteredTickets = (status: string) =>
    filteredByMonth.filter((t) => t.status === status && (
      t.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.geofences?.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (t.users?.username?.toLowerCase() || "").includes(search.toLowerCase())
    ));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-lg">Jumlah Tiket per Status</CardTitle>
          <div>
            <select
              className="px-2 py-1 text-sm border rounded"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
            {/* <span className="ml-2 text-xs">{year}</span> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.keys(STATUS_LABELS).map((status) => (
            <div
              key={status}
              className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm bg-zinc-50 dark:bg-zinc-900"
              style={{ borderColor: STATUS_COLORS[status] }}
            >
              <span className="text-3xl font-bold" style={{ color: STATUS_COLORS[status] }}>
                {statusCounts[status]}
              </span>
              <span className="mb-2 text-sm font-medium text-center">
                {STATUS_LABELS[status]}
              </span>
              <Dialog open={openStatus === status} onOpenChange={(open) => setOpenStatus(open ? status : null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-2">Lihat Daftar Tiket</Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-7xl">
                  <DialogTitle>Daftar Tiket: {STATUS_LABELS[status]}</DialogTitle>
                  <DialogDescription>
                    Berikut adalah daftar tiket dengan status {STATUS_LABELS[status]}. Anda dapat melihat detail tiket dengan menyalin ID tiket dan mencarinya di halaman Tiket.
                  </DialogDescription>
                  <div className="relative w-full max-w-xs mb-4">
                    <input
                      type="text"
                      className="w-full px-2 py-2 text-sm border rounded pr-9"
                      placeholder="Cari tiket, deskripsi, merchant, teknisi..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <span className="absolute text-gray-500 -translate-y-1/2 right-2 top-1/2">
                      <SearchIcon className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[60vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No.</TableHead>
                          <TableHead>ID Tiket</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead>Merchant</TableHead>
                          <TableHead>Teknisi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Dibuat pada</TableHead>
                          <TableHead>Diperbarui pada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets(status).map((ticket, idx) => (
                          <TableRow key={ticket.ticket_id}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{ticket.ticket_id}</TableCell>
                            <TableCell>{ticket.description}</TableCell>
                            <TableCell>
                              <div className="grid">
                                {ticket.geofence_id && tickets.find((t) => t.geofence_id === ticket.geofence_id)?.geofences.description}
                                <Badge variant="secondary" className="text-xs">{ticket.geofence_id}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="grid">
                                {ticket.user_id && tickets.find((t) => t.user_id === ticket.user_id)?.users.username}
                                <Badge variant="secondary" className="text-xs">{ticket.user_id}</Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  ticket.status === "arrived" || ticket.status === "completed"
                                    ? "success"
                                    : ticket.status === "pending" || ticket.status === "started" || ticket.status === "approaching" || ticket.status === "on_progress"
                                      ? "warning"
                                      : ticket.status === "expired"
                                        ? "secondary"
                                        : ticket.status === "assigned" ? "assigned" : "destructive"
                                }
                              >
                                {ticket.status === "assigned" && "Ditugaskan"}
                                {ticket.status === "started" && "Dimulai"}
                                {ticket.status === "on_progress" && "Berjalan"}
                                {ticket.status === "pending" && "Menunggu"}
                                {ticket.status === "approaching" && "Mendekati"}
                                {ticket.status === "arrived" && "Tiba"}
                                {ticket.status === "completed" && "Selesai"}
                                {ticket.status === "expired" && "Kadaluarsa"}
                                {ticket.status === "canceled" && "Dibatalkan"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(ticket.created_at).toLocaleString("id-ID", {
                                hour12: false,
                                timeZone: "Asia/Jakarta",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })} WIB
                            </TableCell>
                            <TableCell>
                              {new Date(ticket.updated_at).toLocaleString("id-ID", {
                                hour12: false,
                                timeZone: "Asia/Jakarta",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })} WIB
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTickets(status).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                              Tidak ada tiket.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <DialogClose asChild>
                    <Button variant="secondary" className="w-full mt-4">Tutup</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
