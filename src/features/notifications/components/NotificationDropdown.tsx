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
      className="absolute end-0 top-full z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">{t('notifications.label')}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasUnread}
          onClick={onMarkAllRead}
        >
          {t('notifications.markAllRead')}
        </Button>
      </header>
      {recentNotifications.length > 0 ? (
        <ul className="max-h-96 overflow-y-auto px-4">
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
      <footer className="border-t border-slate-200 px-4 py-3">
        <Link
          to={ROUTES.NOTIFICATIONS}
          onClick={onClose}
          className="block text-center text-sm font-medium text-blue-700 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {t('dashboard.viewAllNotifications')}
        </Link>
      </footer>
    </section>
  )
}
