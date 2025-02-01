import { useEffect, useState } from "react";
import { handleLogout } from "@/auth/userAuth";
import { Button } from "@/components/ui/button";
import { Home, ListTodo, LogOutIcon, MapPinCheck, Truck, User } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
  {
    title: "Peta Lokasi",
    url: "/maps",
    icon: Home,
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
  // {
  //   title: "Emergency",
  //   url: "/emergency-only",
  //   icon: FileWarningIcon,
  // },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole) setRole(storedRole);
  }, []);

  const handleEmergencyClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, url: string) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to access the Emergency section?")) {
      window.location.href = url;
    }
  };

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
                  <SidebarMenuItem key={item.title} className={item.title === "Emergency" ? "text-red-600" : ""}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        onClick={item.title === "Emergency" ? (e) => handleEmergencyClick(e, item.url) : undefined}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-4 mt-auto">
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
