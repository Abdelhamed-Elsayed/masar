import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './styles'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const spinnerSizes = { sm: 'size-3', md: 'size-5', lg: 'size-8' }

export function Spinner({ size = 'md', label = 'Loading', className, ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      aria-label={label}
      className={cn('inline-block animate-spin rounded-full border-2 border-current border-e-transparent', spinnerSizes[size], className)}
    />
  )
}

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  children: ReactNode
}

const alertVariants: Record<AlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

export function Alert({ variant = 'info', title, children, className, ...props }: AlertProps) {
  return (
    <div
      {...props}
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-4 py-3 text-sm', alertVariants[variant], className)}
    >
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      {children}
    </div>
  )
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div {...props} className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number
}

export function Skeleton({ lines = 1, className, ...props }: SkeletonProps) {
  if (lines < 1 || !Number.isInteger(lines)) {
    throw new RangeError('Skeleton lines must be a positive integer')
  }

  return (
    <div {...props} aria-hidden="true" className={cn('space-y-3', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn('h-4 animate-pulse rounded bg-slate-200', index === lines - 1 && lines > 1 && 'w-4/5')}
        />
      ))}
    </div>
  )
}
