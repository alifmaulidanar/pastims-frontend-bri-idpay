import clsx from "clsx";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { handleLogout } from "@/auth/userAuth";
import { Button } from "@/components/ui/button";
import { FileWarningIcon, Home, ListTodo, LogOutIcon, MapPinCheck, Truck, User } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Peta Lokasi",
    url: "/maps",
    icon: MapPinCheck,
  },
  {
    title: "Pengguna",
    url: "/users",
    icon: User,
  },
  {
    title: "Tempat",
    url: "/places",
    icon: MapPinCheck,
  },
  {
    title: "Tiket",
    url: "/tickets",
    icon: ListTodo,
  },
  {
    title: "Perjalanan",
    url: "/trips",
    icon: Truck,
  },
  {
    title: "Perbaikan (Emergency)",
    url: "/emergency-only",
    icon: FileWarningIcon,
  },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole) setRole(storedRole);
  }, []);

  // const handleEmergencyClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url: string) => {
  //   e.preventDefault();
  //   if (window.confirm("Apakah anda yakin ingin membuka halaman ini?")) {
  //     window.location.href = url;
  //   }
  // };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => {
                  if (item.title === "Users" && role !== "admin") return false;
                  return true;
                })
                .map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={clsx(
                      item.title === "Perbaikan (Emergency)" && "text-red-600 mt-12",
                      item.title !== "Perbaikan (Emergency)" && "flex items-center gap-2",
                      {
                        [`text-[#f0f0f0] bg-[#5e4db2] rounded-lg`]: item.title !== "Perbaikan (Emergency)" && window.location.pathname === item.url,
                        // [`text-[#f0f0f0] bg-[${MAIN_COLOR}] rounded-lg`]: item.title !== "Perbaikan (Emergency)" && window.location.pathname === item.url,
                        "text-[#f0f0f0] bg-[#f26969] rounded-lg": item.title === "Perbaikan (Emergency)" && window.location.pathname === item.url,
                      }
                    )}
                  >
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive ? "text-white" : "text-black"
                        }
                      // onClick={item.title === "Emergency" ? (e) => handleEmergencyClick(e, item.url) : undefined}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-4 mt-auto mb-8">
          <Button
            onClick={handleLogout}
            className="w-full py-2 text-white bg-red-600 rounded hover:bg-red-800"
          >
            <LogOutIcon className="inline" />
            Keluar (Logout)
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
