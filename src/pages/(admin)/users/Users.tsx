/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from '@/types';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Save, Trash2, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchUsers, handleAddUser, handleDeleteUser, handleUpdateUser } from './lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);

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
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      filterAndSortUsers(fetchedUsers, searchQuery, statusFilter, sortOrder);
    };
    getUsers();
  }, []);

  // Sync filteredUsers when users change
  useEffect(() => {
    filterAndSortUsers(users, searchQuery, statusFilter, sortOrder);
  }, [users, searchQuery, statusFilter, sortOrder]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const updatedUsers = await handleAddUser(users, formData);
    setUsers(updatedUsers);
    setOpenDialog(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updatedUsers = await handleUpdateUser(selectedUser, users, formData);
    setUsers(updatedUsers);
    setOpenDialog(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    const deletedUsers = await handleDeleteUser(users, selectedUser);
    setUsers(deletedUsers);
    setOpenAlertDialog(false);
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
    filterAndSortUsers(users, query, statusFilter, sortOrder);
  };

  const handleSort = (key: string) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    filterAndSortUsers(users, searchQuery, statusFilter, order, key);
  };

  const handleFilter = (status: string) => {
    setStatusFilter(status);
    filterAndSortUsers(users, searchQuery, status, sortOrder);
  };

  const filterAndSortUsers = (data: any, query: any, status: any, order: any, sortKey = "username") => {
    let filtered = data;

    // Filter by status
    if (status === "Aktif" || status === "Tidak Aktif") {
      filtered = filtered.filter(
        (user: any) => user.status === (status === "Aktif" ? "active" : "inactive")
      );
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (user: any) =>
          user.user_id.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
      );
    }

    // Sort data
    filtered = filtered.sort((a: any, b: any) => {
      if (order === "asc") {
        return a[sortKey].localeCompare(b[sortKey]);
      }
      return b[sortKey].localeCompare(a[sortKey]);
    });

    setFilteredUsers(filtered);
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
        <Button onClick={() => handleSort("username")}>
          Urutkan Nama ({sortOrder === "asc" ? "A-Z" : "Z-A"})
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Pengguna</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. HP</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Diperbarui pada</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.user_id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.status === "active" ? "Aktif" : "Tidak Aktif"}</TableCell>
              <TableCell>{new Date(user.updated_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</TableCell>
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
    </div>
  );
}
