import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './controls'
import { EmptyState } from './feedback'
import { cn } from './styles'
import { useTranslation } from '@/localization/useTranslation'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

export function Table({ children, className, dir, ...props }: TableProps) {
  const { locale } = useTranslation()
  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="w-full min-w-0 max-w-full overflow-x-auto">
      <table {...props} dir={dir ?? (locale === 'ar' ? 'rtl' : 'ltr')} className={cn('w-full border-collapse text-start text-sm', className)}>{children}</table>
    </div>
  )
}

export interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  label?: string
  className?: string
}

export function Pagination({ page, pageCount, onPageChange, label, className }: PaginationProps) {
  const { t, locale } = useTranslation()
  if (!Number.isInteger(page) || !Number.isInteger(pageCount) || pageCount < 1 || page < 1 || page > pageCount) {
    throw new RangeError('Pagination requires page and pageCount to describe a valid page')
  }

  return (
    <nav aria-label={label ?? t('common.pagination')} className={cn('flex items-center justify-between gap-3', className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('common.previous')}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
        <span>{t('common.previous')}</span>
      </Button>
      <span aria-live="polite" className="text-sm text-slate-600">
        {t('common.page')} {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(page)} {t('common.of')} {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(pageCount)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t('common.next')}
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <span>{t('common.next')}</span>
        <ChevronRight size={16} className="rtl:rotate-180" aria-hidden="true" />
      </Button>
    </nav>
  )
}

export interface TableEmptyStateProps {
  title?: string
  description?: string
  colSpan: number
}

export function TableEmptyState({
  title,
  description,
  colSpan,
}: TableEmptyStateProps) {
  const { t } = useTranslation()
  if (!Number.isInteger(colSpan) || colSpan < 1) {
    throw new RangeError('TableEmptyState colSpan must be a positive integer')
  }
  return (
    <tr>
      <td colSpan={colSpan}>
        <EmptyState title={title ?? t('common.noResults')} description={description} />
      </td>
    </tr>
  )
}
