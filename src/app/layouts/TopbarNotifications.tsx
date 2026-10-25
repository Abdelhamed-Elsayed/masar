import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from '@/localization/useTranslation'
import { useNotificationStore } from '@/store/notificationStore'
import { useDirectoryStore } from '@/store/directoryStore'
import {
  NotificationBadge,
  NotificationDropdown,
} from '@/features/notifications'

export function TopbarNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { t, locale } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const currentUserId = currentUser?.id ?? null
  const isAdmin = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const notifications = useNotificationStore((state) => state.notifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const userNotifications = currentUser
    ? notifications
        .filter((notification) => notification.userId === currentUser.id)
        .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
    : []
  const unreadCount = userNotifications.filter((notification) => !notification.isRead).length

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`${t('notifications.label')}${unreadCount > 0 ? locale === 'ar' ? `، ${new Intl.NumberFormat('ar-EG').format(unreadCount)} ${t('notifications.unreadPlural')}` : `, ${unreadCount} ${t('notifications.unreadPlural')}` : ''}`}
        aria-expanded={isOpen}
        aria-controls="topbar-notifications-dropdown"
        onClick={() => setIsOpen((open) => !open)}
        className={isAdmin ? "rounded-lg p-2 text-slate-300 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" : "rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"}
      >
        <span className="relative block">
          <Bell size={20} aria-hidden="true" />
          <NotificationBadge count={unreadCount} />
        </span>
      </button>
      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
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
        </>
      ) : null}
    </div>
  )
}
