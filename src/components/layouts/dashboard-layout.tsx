import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/customs/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="w-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
