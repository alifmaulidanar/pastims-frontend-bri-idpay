import { useEffect, useState } from "react";
import { handleLogout } from "@/auth/userAuth";
import { Button } from "@/components/ui/button";
import { Home, LogOutIcon, User, UserCircle } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "/users",
    icon: User,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: UserCircle,
  },
];

export function AppSidebar() {
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));

  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole) setRole(storedRole);
  }, []);

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
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
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
            <LogOutIcon className="inline mr-2" />
            Logout
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
