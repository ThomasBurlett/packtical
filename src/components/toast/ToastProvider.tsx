import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Button } from "@heroui/react"
import { AlertTriangle, X } from "lucide-react"
import { ToastContext, type ToastInput, type ToastTone } from "@/components/toast/toast-context"

type ToastMessage = ToastInput & {
  id: string
  tone: ToastTone
}

const TOAST_LIFETIME_MS = 8000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const showToast = useCallback((toast: ToastInput) => {
    const toastId = buildToastId()
    const nextToast: ToastMessage = {
      ...toast,
      id: toastId,
      tone: toast.tone ?? "error",
    }

    setToasts((current) => [...current.slice(-2), nextToast])
    window.setTimeout(() => dismissToast(toastId), TOAST_LIFETIME_MS)
  }, [dismissToast])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="assertive" aria-relevant="additions">
        {toasts.map((toast) => (
          <div className={`toast-card toast-card-${toast.tone}`} key={toast.id} role="alert">
            <span className="toast-icon" aria-hidden="true">
              <AlertTriangle size={17} strokeWidth={2.1} />
            </span>
            <div className="toast-copy">
              <strong>{toast.title}</strong>
              {toast.description ? <span>{toast.description}</span> : null}
            </div>
            <Button
              aria-label="Dismiss notification"
              className="toast-close-button"
              isIconOnly
              onPress={() => dismissToast(toast.id)}
              size="sm"
              variant="ghost"
            >
              <X aria-hidden="true" size={14} strokeWidth={2.1} />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function buildToastId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
