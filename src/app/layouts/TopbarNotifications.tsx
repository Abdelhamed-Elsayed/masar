import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/localization/useTranslation'
import { useNotificationStore } from '@/store/notificationStore'
import {
  NotificationBadge,
  NotificationDropdown,
} from '@/features/notifications'

export function TopbarNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, locale } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const notifications = useNotificationStore((state) => state.notifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const userNotifications = currentUser
    ? notifications
        .filter((notification) => notification.userId === currentUser.id)
        .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
    : []
  const unreadCount = userNotifications.filter((notification) => !notification.isRead).length

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`${t('notifications.label')}${unreadCount > 0 ? locale === 'ar' ? `، ${new Intl.NumberFormat('ar-EG').format(unreadCount)} ${t('notifications.unreadPlural')}` : `, ${unreadCount} ${t('notifications.unreadPlural')}` : ''}`}
        aria-expanded={isOpen}
        aria-controls="topbar-notifications-dropdown"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setIsOpen(false)
        }}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <span className="relative block">
          <Bell size={20} aria-hidden="true" />
          <NotificationBadge count={unreadCount} />
        </span>
      </button>
      {isOpen ? (
        <div id="topbar-notifications-dropdown">
          <NotificationDropdown
            notifications={userNotifications}
            onRead={markAsRead}
            onMarkAllRead={() => {
              if (currentUser) markAllAsRead(currentUser.id)
            }}
            onClose={() => setIsOpen(false)}
          />
        </div>
      ) : null}
    </div>
  )
}
