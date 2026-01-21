
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts = [] } = useToast()

  return (
    <ToastProvider>
      {toasts && toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className={`${
              variant === "destructive" 
                ? "border-l-4 border-l-red-500 bg-zinc-950/90 text-white backdrop-blur-sm shadow-lg" 
                : variant === "success"
                ? "border-l-4 border-l-green-500 bg-zinc-950/90 text-white backdrop-blur-sm shadow-lg"
                : "border-l-4 border-l-yellow-500 bg-zinc-950/90 text-white backdrop-blur-sm shadow-lg"
            } shadow-lg dark:bg-zinc-950/90 animate-in slide-in-from-right-full duration-300`}
          >
            <div className="flex p-2">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {variant === "destructive" ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : variant === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <Info className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div className="grid gap-1">
                {title && (
                  <ToastTitle className={
                    variant === "destructive" 
                      ? "text-white font-medium text-sm" 
                      : variant === "success"
                      ? "text-white font-medium text-sm"
                      : "text-white font-medium text-sm"
                  }>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className={
                    "text-gray-300 text-xs"
                  }>
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="absolute top-2 right-2 text-white opacity-70 hover:opacity-100" />
          </Toast>
        )
      })}
      <ToastViewport className="p-6 md:p-4" />
    </ToastProvider>
  )
}
