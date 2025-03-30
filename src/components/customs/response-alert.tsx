import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XCircle, CheckCircle2, AlertCircle } from "lucide-react"

interface ResponseStatusProps {
  status: 'success' | 'error' | 'warning'
  title: string
  description?: string
  errors?: Array<{
    message: string
    details?: string
  }>
  onDismiss?: () => void
  zIndex?: number
  className?: string
}

export function ResponseStatus({
  status,
  title,
  description,
  errors,
  onDismiss,
  zIndex = 50,
  className
}: ResponseStatusProps) {
  const statusConfig = {
    success: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    }
  }

  const { icon: Icon, color, bg } = statusConfig[status]

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
      style={{ zIndex }}
    >
      <div className="flex flex-col w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-lg">
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 mt-0.5 ${color}`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {errors && errors.length > 0 && (
          <div className={`p-4 text-sm rounded-md ${bg}`}>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="list-disc list-inside">
                  <span className="font-medium">{error.message}</span>
                  {error.details && (
                    <p className="mt-1 text-muted-foreground">
                      {error.details}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {onDismiss && (
          <Button
            variant="outline"
            className="mt-4 ml-auto"
            onClick={() => {
              onDismiss();
              window.location.reload();
            }}
          >
            Tutup
          </Button>
        )}
      </div>
    </div >
  )
}