import { User } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Save, Trash2, UserPlus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchUsers, handleAddUser, handleDeleteUser, handleUpdateUser } from './lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    getUsers();
  }, []);

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

  return (
    <div className="w-[85%] max-w-screen-xxl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Daftar Pengguna</h1>

      <Button className="mb-4" onClick={() => handleAddOrUpdate(null)}>
        <UserPlus className="inline" />
        Tambahkan Pengguna
      </Button>

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
          {users.map(user => (
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
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
