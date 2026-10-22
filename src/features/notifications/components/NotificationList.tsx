import { Virtuoso } from 'react-virtuoso'
import { EmptyState } from '@/components/ui'
import type { Notification } from '@/types/notification'
import { NotificationItem } from './NotificationItem'
import { useTranslation } from '@/localization/useTranslation'

interface NotificationListProps {
  notifications: Notification[]
  onRead: (id: string) => void
}

export function NotificationList({ notifications, onRead }: NotificationListProps) {
  const { t } = useTranslation()
  if (notifications.length === 0) {
    return (
      <EmptyState
        title={t('dashboard.caughtUp')}
        description={t('dashboard.noNotifications')}
      />
    )
  }

  if (notifications.length >= 100) {
    return (
      <div role="list" aria-label={t('notifications.label')}>
        <Virtuoso
          data={notifications}
          style={{ height: 'min(70vh, 42rem)' }}
          computeItemKey={(_, notification) => notification.id}
          itemContent={(_, notification) => (
            <div role="listitem">
              <NotificationItem
                notification={notification}
                onRead={onRead}
                asListItem={false}
              />
            </div>
          )}
        />
      </div>
    )
  }

  return (
    <ul aria-label={t('notifications.label')} className="divide-y divide-slate-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
        />
      ))}
    </ul>
  )
}
