import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  zIndex?: number
  className?: string
}

export function LoadingOverlay({ isLoading, message = "Memuat...", zIndex = 50, className }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={cn("fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm", className)}
      style={{ zIndex }}
    >
      <div className="flex flex-col items-center justify-center w-1/6 p-6 space-y-4 bg-white rounded-lg shadow-lg">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-center text-foreground">{message}</p>
      </div>
    </div>
  )
}

