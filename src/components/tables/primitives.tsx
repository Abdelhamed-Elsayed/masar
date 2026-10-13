import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from 'react'
import { Table as UiTable, TableEmptyState as UiTableEmptyState } from '@/components/ui'
import { cn } from '@/components/ui/styles'

export interface DataTableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
  caption?: string
}

export function DataTable({ children, caption, className, ...props }: DataTableProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200">
      <UiTable {...props} className={className}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </UiTable>
    </div>
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={cn('bg-slate-50 text-slate-600', className)} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cn('border-b border-slate-200 last:border-b-0', className)} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={cn('px-4 py-3 align-middle text-slate-700', className)} />
}

export function TableHeadCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props} scope={props.scope ?? 'col'} className={cn('px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide', className)} />
}

export interface TableEmptyStateProps {
  title?: string
  description?: string
  colSpan: number
}

export function TableEmptyState(props: TableEmptyStateProps) {
  return <UiTableEmptyState {...props} />
}
