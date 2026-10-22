import type { ComponentProps, ReactNode } from 'react'
import { Alert, Button, EmptyState as UiEmptyState, Modal, Spinner } from '@/components/ui'

export interface LoadingStateProps {
  label?: string
  description?: string
}

export function LoadingState({ label = 'Loading', description }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center" role="status">
      <Spinner label={label} size="lg" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </div>
  )
}

export interface ErrorStateProps {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorState({ title = 'Something went wrong', message, action }: ErrorStateProps) {
  return (
    <div className="mx-auto max-w-xl py-8">
      <Alert variant="error" title={title}>{message}</Alert>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export interface SuccessMessageProps {
  title?: string
  children: ReactNode
}

export function SuccessMessage({ title, children }: SuccessMessageProps) {
  return <Alert variant="success" title={title}>{children}</Alert>
}

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isConfirming?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={isConfirming} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" variant="danger" loading={isConfirming} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export function EmptyState(props: ComponentProps<typeof UiEmptyState>) {
  return <UiEmptyState {...props} />
}
