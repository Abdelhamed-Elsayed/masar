import { Check, Circle } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { inboxDetailsPath, requestDetailsPath, ROUTES } from '@/constants/routes'
import { NotificationType } from '@/types/notification'
import type { Notification } from '@/types/notification'
import { useTranslation } from '@/localization/useTranslation'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  compact?: boolean
  asListItem?: boolean
}

const typeLabelKeys = {
  [NotificationType.NEW_ACTION_REQUIRED]: 'notification.actionRequired',
  [NotificationType.REQUEST_APPROVED]: 'notification.requestApproved',
  [NotificationType.REQUEST_REJECTED]: 'notification.requestRejected',
  [NotificationType.REQUEST_MOVED]: 'notification.requestUpdated',
  [NotificationType.FINAL_DECISION]: 'notification.finalDecision',
} as const

function notificationPath(notification: Notification): string {
  if (!notification.requestId) return ROUTES.NOTIFICATIONS
  return notification.type === NotificationType.NEW_ACTION_REQUIRED
    ? inboxDetailsPath(notification.requestId)
    : requestDetailsPath(notification.requestId)
}

export function NotificationItem({
  notification,
  onRead,
  compact = false,
  asListItem = true,
}: NotificationItemProps) {
  const { t, locale, content } = useTranslation()
  const Item = asListItem ? 'li' : 'div'
  const typeLabelKey = typeLabelKeys[notification.type]
  return (
    <Item
      role={asListItem ? undefined : 'listitem'}
      className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800"
    >
      <span className="mt-1 flex size-5 shrink-0 items-center justify-center">
        <Circle
          size={8}
          className={notification.isRead ? 'fill-slate-300 text-slate-300 dark:fill-slate-600 dark:text-slate-600' : 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400'}
          aria-hidden="true"
        />
      </span>
      <Link
        to={notificationPath(notification)}
        onClick={() => onRead(notification.id)}
        className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <span className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`break-words text-sm font-semibold text-slate-900 dark:text-slate-100 ${compact ? 'line-clamp-2' : ''}`}>
            {content(notification.title)}
          </span>
          {!compact ? (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {typeLabelKey ? t(typeLabelKey) : t('notifications.label')}
            </span>
          ) : null}
        </span>
        <span className={`mt-1 block text-sm text-slate-600 break-words dark:text-slate-300 ${compact ? 'line-clamp-2' : ''}`}>
          {content(notification.body)}
        </span>
        <time dateTime={notification.createdAt} className="mt-1 block text-xs text-slate-400 dark:text-slate-500">
          {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(notification.createdAt))}
        </time>
      </Link>
      {!notification.isRead ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRead(notification.id)}
          aria-label={`${t('notifications.markRead')}: ${content(notification.title)}`}
          className="shrink-0 p-2 min-h-8 min-w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Check size={15} aria-hidden="true" />
          <span className="hidden sm:inline">{t('notifications.markRead')}</span>
        </Button>
      ) : null}
    </Item>
  )
}
