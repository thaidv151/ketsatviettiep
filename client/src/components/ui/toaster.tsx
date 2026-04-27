'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              {props.variant === 'success' && (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              )}
              {props.variant === 'destructive' && (
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
                  aria-hidden
                />
              )}
              {(!props.variant || props.variant === 'default') && (
                <Info
                  className="mt-0.5 h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400"
                  aria-hidden
                />
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
