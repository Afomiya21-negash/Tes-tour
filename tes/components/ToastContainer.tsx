"use client"

import Toast from "./Toast"
import type { ToastMessage } from "@/hooks/useToast"

interface ToastContainerProps {
  toasts: ToastMessage[]
  removeToast: (id: number) => void
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{ marginTop: index > 0 ? "0.5rem" : "0" }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

