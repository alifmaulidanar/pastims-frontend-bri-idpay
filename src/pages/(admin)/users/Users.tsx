/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@/types';
import { fetchUsers } from '@/lib/users';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LoadingOverlay } from '@/components/customs/loading-state';
import { ResponseStatus } from '@/components/customs/response-alert';
import { handleAddUser, handleDeleteUser, handleUpdateUser } from './lib/actions';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Download, Pencil, Save, Trash2, UserPlus, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Memuat data...");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(selectedUser?.role || 'user');
  const [apiResponse, setApiResponse] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning'
    title?: string
    description?: string
    errors?: Array<{ message: string, details?: string }>
  }>({ status: 'idle' })
  const [devMode, setDevMode] = useState(false);
  // const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Default 10 rows
  // const [currentPage, setCurrentPage] = useState<number>(1);

  // useEffect(() => {
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";

    return () => {
      document.body.style.overflowX = "";
      document.body.style.overflowY = "";
    };
  }, []);

  //  Fetch users on mount
  useEffect(() => {
    const getUsers = async () => {
      setIsLoading(true);
      setLoadingMessage("Memuat data pengguna...");
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
        filterAndSortUsers(fetchedUsers, searchQuery, statusFilter, sortOrder, devMode);
      } catch (error: any) {
        setIsLoading(false);
        setApiResponse({
          status: 'error',
          title: 'Kesalahan',
          description: `Gagal memuat data pengguna. ${error}`,
        });
      } finally {
        setIsLoading(false);
      }
    };
    getUsers();
  }, []);

  // Sync filteredUsers when users change
  useEffect(() => {
    // filterAndSortUsers(users, searchQuery, statusFilter, sortOrder);
    filterAndSortUsers(users, searchQuery, statusFilter, sortOrder, devMode);
    // }, [users, searchQuery, statusFilter, sortOrder]);
  }, [users, searchQuery, statusFilter, sortOrder, devMode]);

  // Paginate users
  // const paginatedUsers = filteredUsers.slice(
  //   (currentPage - 1) * rowsPerPage,
  //   currentPage * rowsPerPage
  // );

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenDialog(false);
    setIsLoading(true);
    setLoadingMessage("Menyimpan pengguna...");
    const formData = new FormData(e.target as HTMLFormElement);
    formData.set('role', selectedRole);
    const updatedUsers = await handleAddUser(users, formData);
    setUsers(updatedUsers);
    setIsLoading(false);
    setApiResponse({
      status: 'success',
      title: 'Berhasil',
      description: `Pengguna ${formData.get('username')} berhasil ditambahkan.`,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setOpenDialog(false);
    setIsLoading(true);
    setLoadingMessage("Memperbarui pengguna...");
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedUsers = await handleUpdateUser(selectedUser, users, formData);
    setUsers(updatedUsers);
    setIsLoading(false);
    setApiResponse({
      status: 'success',
      title: 'Berhasil',
      description: `Pengguna ${formData.get('username')} berhasil diperbarui.`,
    });
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setOpenAlertDialog(false);
    setIsLoading(true);
    setLoadingMessage("Menghapus pengguna...");
    const deletedUsers = await handleDeleteUser(users, selectedUser);
    setUsers(deletedUsers);
    setIsLoading(false);
    setApiResponse({
      status: 'success',
      title: 'Berhasil',
      description: `Pengguna ${selectedUser.username} berhasil dihapus.`,
    });
  };

  const handleAddOrUpdate = (user: User | null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleAlertDialog = (user: User | null) => {
    setSelectedUser(user);
    setOpenAlertDialog(true)
  };

  const handleSearch = (e: { target: { value: string; }; }) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    // filterAndSortUsers(users, query, statusFilter, sortOrder);
    filterAndSortUsers(users, query, statusFilter, sortOrder, devMode);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(order);
    // filterAndSortUsers(users, searchQuery, statusFilter, order, key);
    filterAndSortUsers(users, searchQuery, statusFilter, order, devMode, key);
  };

  const handleFilter = (status: string) => {
    setStatusFilter(status);
    // filterAndSortUsers(users, searchQuery, status, sortOrder);
    filterAndSortUsers(users, searchQuery, status, sortOrder, devMode);
  };

  const filterAndSortUsers = (
    data: User[],
    query: string,
    status: string,
    order: string,
    devMode: boolean,
    sortKey: string = "username"
  ) => {
    let filtered = data;

    // 🟨DEV MODE🟨
    if (!devMode) {
      filtered = filtered.filter((user: any) => {
        // return !/^\[.*\]$/.test(user.username);
        return !/^\[.*\]$/.test(user.username) &&
          !user.email.endsWith('@example.com')
        // user.phone !== '~';
      });
    }

    // Filter by status
    if (status === "Aktif" || status === "Tidak Aktif") {
      filtered = filtered.filter(
        (user) => user.status === (status === "Aktif" ? "active" : "inactive")
      );
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (user) =>
          user.user_id.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
      );
    }

    // Sort data
    filtered = filtered.sort((a: any, b: any) => {
      const aValue = a[sortKey]?.toString().toLowerCase() || "";
      const bValue = b[sortKey]?.toString().toLowerCase() || "";
      if (order === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });
    setFilteredUsers(filtered);
  };

  const downloadCSV = () => {
    if (filteredUsers.length === 0) {
      alert("Tidak ada data untuk diunduh.");
      return;
    }

    // Column Header CSV
    const headers = [
      "ID Pengguna",
      "Nama",
      "Email",
      "No. HP",
      "Status",
      "Diperbarui (WIB)"
    ];

    // Table Data
    const rows = filteredUsers.map((user) => [
      user.user_id,
      user.username,
      user.email,
      user.phone,
      user.status === "active" ? "Aktif" : "Tidak Aktif",
      new Date(user.updated_at).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(".", ":")
    ]);

    // Combine headers and rows
    const csvContent =
      [headers.join(";"), ...rows.map((row) => row.map((value) => `"${value}"`).join(";"))].join("\n");

    // Create Blob object to store CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Trigger file download
    const link = document.createElement("a");
    link.href = url;
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
    link.setAttribute("download", `data-pengguna-${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (key: string) => {
    if (sortKey === key) {
      return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return null;
  };

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      {/* Set Page Title */}
      <Helmet>
        <title>Pengguna</title>
      </Helmet>

      <h1 className="mb-4 text-2xl font-semibold">Daftar Pengguna</h1>

      {/* Add user button */}
      <Button className="mb-4" onClick={() => handleAddOrUpdate(null)}>
        <UserPlus className="inline" />
        Tambahkan Pengguna
      </Button>

      {/* Search, Sort, and Filter */}
      <div className="flex items-center mb-4 space-x-4">
        <Input
          type="text"
          placeholder="Cari pengguna..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-1/3"
        />
        <Select
          onValueChange={(value) => handleFilter(value)}
          value={statusFilter}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
        {/* <Button onClick={() => handleSort("username")}>
          Urutkan Nama ({sortOrder === "asc" ? "A-Z" : "Z-A"})
        </Button> */}

        {/* Download CSV button */}
        <Button onClick={downloadCSV} variant="secondary">
          <Download className="inline" />
          Unduh Data Pengguna
        </Button>

        {/* Development Mode Toggle */}
        <div className="flex items-center mb-6 space-x-4">
          <Switch
            id="dev-mode-toggle"
            checked={devMode}
            onCheckedChange={(checked) => setDevMode(checked)}
          />
          <label htmlFor="dev-mode-toggle" className="text-sm font-medium">
            Development Mode
          </label>
        </div>
      </div>

      {/* <div className='mb-2'>
        <Select
          onValueChange={(value) => {
            setRowsPerPage(value === "Semua" ? filteredUsers.length : parseInt(value));
            setCurrentPage(1); // Reset to the first page
          }}
          value={rowsPerPage.toString()}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Jumlah Baris" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="Semua">Semua</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Menampilkan {paginatedUsers.length} dari {filteredUsers.length} pengguna
          </p>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Sebelumnya
            </Button>
            <p className="text-sm text-gray-500">
              Halaman {currentPage} dari {Math.ceil(filteredUsers.length / rowsPerPage)}
            </p>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredUsers.length / rowsPerPage)}
              variant="outline"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </div> */}

      <div className='mb-2'>
        <p className="text-sm font-bold text-gray-500">
          Menampilkan pengguna: {filteredUsers.length}
        </p>
      </div>
      <div className='mb-2'>
        <p className="text-sm text-gray-500">
          Klik pada <span className='italic'>header</span> kolom untuk mengurutkan data.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead onClick={() => handleSort("user_id")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("user_id")}
                ID Pengguna
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("username")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("username")}
                Nama
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("email")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("email")}
                Email
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("phone")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("phone")}
                No. HP
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("role")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("role")}
                Role
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("status")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("status")}
                Status
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort("updated_at")}>
              <div className='flex items-center gap-x-2'>
                {getSortIcon("updated_at")}
                Diperbarui (WIB)
              </div>
            </TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* {paginatedUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell> */}
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{filteredUsers.indexOf(user) + 1}</TableCell>
              <TableCell>{user.user_id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                {/* jika role === user maka badge shadcn ui default, jika role === client maka badge shadcnui warning */}
                <Badge variant={user.role === "user" ? "assigned" : "warning"}>{user.role}</Badge>
              </TableCell>
              <TableCell>{user.status === "active" ? "Aktif" : "Tidak Aktif"}</TableCell>
              <TableCell>
                {new Date(user.updated_at).toLocaleString('id-ID', {
                  timeZone: 'Asia/Jakarta',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).replace('.', ':')}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleAddOrUpdate(user)} variant="outline" className="mr-2">
                  <Pencil className="inline" />
                </Button>
                <Button onClick={() => handleAlertDialog(user)} variant="destructive">
                  <Trash2 className="inline" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog for adding or updating user */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button className="hidden" />
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{selectedUser ? 'Edit Pengguna' : 'Tambahkan Pengguna'}</DialogTitle>
          <form className="space-y-4" onSubmit={selectedUser ? handleUpdate : handleAdd}>
            <div className='grid items-center grid-cols-4 gap-x-4'>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Pilih Role
              </label>
              <div className='col-span-3'>
                <Select
                  value={selectedUser?.role || selectedRole}
                  onValueChange={(value) => setSelectedRole(value)}
                >
                  <SelectTrigger id="role" name='role' className="w-full">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <input
              type="text"
              name="email"
              placeholder="Email"
              defaultValue={selectedUser?.email || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Kata Sandi"
              hidden={selectedUser ? true : false}
              defaultValue={selectedUser?.password || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="username"
              placeholder="Nama"
              defaultValue={selectedUser?.username || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="No. HP"
              defaultValue={selectedUser?.phone || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setOpenDialog(false)} variant="outline">
                <X className="inline" />
                Batal
              </Button>
              <Button type="submit">
                <Save className="inline" />
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for delete confirmation */}
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Apakah Anda yakin ingin menghapus pengguna ini?</AlertDialogTitle>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
              <X className="inline" />
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete()}>
              <Trash2 className="inline" />
              Ya, hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
      {apiResponse.status !== 'idle' && (
        <ResponseStatus
          status={apiResponse.status}
          title={apiResponse.title || ''}
          description={apiResponse.description}
          errors={apiResponse.errors}
          onDismiss={() => setApiResponse({ status: 'idle' })}
        />
      )}
    </div>
  );
}
