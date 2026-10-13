import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/components/ui/styles'

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div {...props} className={cn('mx-auto w-full min-w-0 max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header {...props} className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 break-words text-sm text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap items-center gap-2 [&>*]:flex-1 sm:w-auto sm:shrink-0 sm:[&>*]:flex-none">{actions}</div> : null}
    </header>
  )
}

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function Section({ title, description, actions, className, children, ...props }: SectionProps) {
  return (
    <section {...props} className={cn('space-y-4', className)}>
      {title || description || actions ? (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {title ? <h2 className="break-words text-lg font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 break-words text-sm text-slate-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex w-full flex-wrap items-center gap-2 [&>*]:flex-1 sm:w-auto sm:shrink-0 sm:[&>*]:flex-none">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export interface ContentCardProps extends HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  children: ReactNode
}

export function ContentCard({ title, description, children, className, ...props }: ContentCardProps) {
  return (
    <section {...props} className={cn('min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {title || description ? (
        <header className="border-b border-slate-200 px-5 py-4">
          {title ? <h2 className="text-base font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </header>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
