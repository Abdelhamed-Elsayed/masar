import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react'
import { Table as UiTable, TableEmptyState as UiTableEmptyState } from '@/components/ui'
import { cn } from '@/components/ui/styles'

export interface DataTableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
  caption?: string
}

export function DataTable({ children, caption, className, ...props }: DataTableProps) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <UiTable {...props} className={className}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </UiTable>
    </div>
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={cn('bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-200', className)} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn('border-b border-slate-200 transition-colors last:border-b-0 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-slate-800/70', className)} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-200', className)} />
}

export function TableHeadCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} scope={props.scope ?? 'col'} className={cn('whitespace-nowrap px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide', className)} />
}

export interface TableEmptyStateProps {
  title?: string
  description?: string
  colSpan: number
}

export function TableEmptyState(props: TableEmptyStateProps) {
  return <UiTableEmptyState {...props} />
}
