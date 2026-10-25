import { cn } from '@/components/ui/styles'
import { useTranslation } from '@/localization/useTranslation'

interface NotificationBadgeProps {
  count: number
  className?: string
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  const { t, locale } = useTranslation()
  if (count === 0) return null

  return (
    <span
      aria-label={`${locale === 'ar' ? new Intl.NumberFormat('ar-EG').format(count) : count} ${t('notifications.unreadPlural')}`}
      className={cn(
        'absolute -end-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
