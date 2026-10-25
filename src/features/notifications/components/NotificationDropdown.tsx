import { Link } from 'react-router'
import { Button, EmptyState } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import type { Notification } from '@/types/notification'
import { useTranslation } from '@/localization/useTranslation'
import { NotificationItem } from './NotificationItem'

interface NotificationDropdownProps {
  notifications: Notification[]
  onRead: (id: string) => void
  onMarkAllRead: () => void
  onClose: () => void
}

export function NotificationDropdown({
  notifications,
  onRead,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  const { t } = useTranslation()
  const recentNotifications = notifications.slice(0, 5)
  const hasUnread = notifications.some((notification) => !notification.isRead)

  return (
    <section
      aria-label={t('notifications.recent')}
      className="fixed inset-x-3 top-16 z-50 flex max-h-[calc(100dvh-5.5rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-[32rem] sm:w-96"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t('notifications.label')}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasUnread}
          onClick={onMarkAllRead}
          className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          {t('notifications.markAllRead')}
        </Button>
      </header>
      {recentNotifications.length > 0 ? (
        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 dark:divide-slate-800">
          {recentNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => {
                onRead(id)
                onClose()
              }}
              compact
            />
          ))}
        </ul>
      ) : (
        <EmptyState title={t('notifications.none')} className="py-8" />
      )}
      <footer className="shrink-0 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <Link
          to={ROUTES.NOTIFICATIONS}
          onClick={onClose}
          className="block text-center text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('dashboard.viewAllNotifications')}
        </Link>
      </footer>
    </section>
  )
}
