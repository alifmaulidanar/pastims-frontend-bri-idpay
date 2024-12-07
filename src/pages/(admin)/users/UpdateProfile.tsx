// import supabase from "@/utils/supabase";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useUser } from "@supabase/auth-helpers-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// const UpdateUserInfo = () => {
//   const user = useUser();
//   const [name, setName] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [role, setRole] = useState<string>("");

//   useEffect(() => {
//     if (user) {
//       setName(user?.user_metadata?.username || "");
//       setEmail(user?.email || "");
//       setPhone(user?.user_metadata?.phone || "");
//       setRole(user?.user_metadata?.user_role || "user");
//     }
//   }, [user]);

//   // Fungsi untuk update informasi pengguna
//   const handleUpdate = async () => {
//     if (user) {
//       try {
//         const { error } = await supabase.auth.updateUser({
//           data: {
//             username: name,
//             phone: phone,
//             user_role: role,
//           },
//         });

//         if (error) {
//           throw error;
//         }
//         alert("Informasi berhasil diperbarui!");
//       } catch (error) {
//         console.error("Error updating user info:", error);
//         alert("Gagal memperbarui informasi.");
//       }
//     }
//   };

//   return (
//     <div className="max-w-lg p-4 mx-auto space-y-4">
//       {/* Username */}
//       <Input
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Nama Lengkap"
//         className="w-full p-2 border border-gray-300 rounded-md"
//       />
//       {/* Email */}
//       <Input
//         type="email"
//         value={email}
//         placeholder="Email"
//         className="w-full p-2 border border-gray-300 rounded-md"
//         disabled
//       />
//       {/* Phone */}
//       <Input
//         type="text"
//         value={phone}
//         onChange={(e) => setPhone(e.target.value)}
//         placeholder="Nomor Telepon"
//         className="w-full p-2 border border-gray-300 rounded-md"
//       />
//       {/* Role */}
//       <Select value={role} onValueChange={setRole}>
//         <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md">
//           <SelectValue placeholder="Role" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="admin">Admin</SelectItem>
//           <SelectItem value="user">User</SelectItem>
//         </SelectContent>
//       </Select>
//       {/* Button to update */}
//       <Button onClick={handleUpdate} className="w-full py-2 text-white bg-blue-500 rounded-md">
//         Perbarui Informasi
//       </Button>
//     </div>
//   );
// };

// export default UpdateUserInfo;
