import { User } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);

  // Fetch users from the backend API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8787/users');
        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          console.error('Failed to fetch users:', data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const phone = formData.get('phone') as string;

    const requestPayload = {
      user_id: selectedUser.user_id,
      email,
      username,
      phone,
    };

    try {
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch('http://127.0.0.1:8787/updateuser', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedUser) {
          setUsers(users.map(user => (user.id === selectedUser.id ? data : user)));
        } else {
          setUsers([data, ...users]);
        }
        setOpenDialog(false);
      } else {
        console.error('Failed to update user:', data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    const requestPayload = {
      email,
      username,
      password,
      phone,
    };

    try {
      const response = await fetch('http://127.0.0.1:8787/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([data, ...users]);
        setOpenDialog(false);
      } else {
        console.error('Failed to add user:', data.message);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8787/deleteuser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: selectedUser?.user_id }),
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
        setOpenAlertDialog(false);
      } else {
        console.error('Failed to delete user:', data.message);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
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
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">User Dashboard</h1>

      <Button className="mb-4" onClick={() => handleAddOrUpdate(null)}>
        Add New User
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <Button onClick={() => handleAddOrUpdate(user)} variant="outline" className="mr-2">
                  Edit
                </Button>
                <Button onClick={() => handleAlertDialog(user)} variant="destructive">
                  Delete
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
          <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
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
              placeholder="Password"
              hidden={selectedUser ? true : false}
              defaultValue={selectedUser?.password || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              defaultValue={selectedUser?.username || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              defaultValue={selectedUser?.phone || ''}
              className="w-full px-4 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setOpenDialog(false)} variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for delete confirmation */}
      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
          <div className="flex justify-end space-x-2">
            <AlertDialogCancel onClick={() => setOpenAlertDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(selectedUser?.id || '')}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
