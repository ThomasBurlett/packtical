import { createContext, useContext } from "react"

export type ToastTone = "error"

export type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
}

export type ToastContextValue = {
  showToast: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const value = useContext(ToastContext)

  if (!value) {
    throw new Error("useToast must be used inside ToastProvider.")
  }

  return value
}
