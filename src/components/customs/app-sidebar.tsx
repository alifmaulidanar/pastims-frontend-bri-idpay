import { Home, LogOutIcon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { handleLogout } from "@/auth/userAuth";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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

        {/* Menambahkan tombol Logout di bagian bawah sidebar */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-white bg-red-600 rounded hover:bg-red-800"
          >
            <LogOutIcon className="inline mr-2" />
            Logout
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
