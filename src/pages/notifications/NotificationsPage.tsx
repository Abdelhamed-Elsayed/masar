import { useMemo, useState } from 'react'
import { Button, Select } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { NotificationList } from '@/features/notifications'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useTranslation } from '@/localization/useTranslation'

export function NotificationsPage() {
  const { t, locale } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const notifications = useNotificationStore((state) => state.notifications)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const userNotifications = useMemo(
    () =>
      currentUser
        ? notifications
            .filter((notification) => notification.userId === currentUser.id)
            .filter((notification) => filter === 'all' || !notification.isRead)
            .toSorted((left, right) => right.createdAt.localeCompare(left.createdAt))
        : [],
    [currentUser, filter, notifications],
  )
  const unreadCount = userNotifications.filter(
    (notification) => !notification.isRead,
  ).length

  return (
    <PageContainer>
      <PageHeader
        title={t('notifications.title')}
        description={
          unreadCount > 0
            ? `${locale === 'ar' ? new Intl.NumberFormat('ar-EG').format(unreadCount) : unreadCount} ${unreadCount === 1 ? t('notifications.unreadSingle') : t('notifications.unreadPlural')}`
            : t('notifications.upToDate')
        }
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0 || !currentUser}
            onClick={() => {
              if (currentUser) markAllAsRead(currentUser.id)
            }}
            className="w-full sm:w-auto"
          >
            {t('notifications.markAllRead')}
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400 sm:w-auto sm:justify-start">
          <span className="font-medium shrink-0">{t('notifications.filter')}</span>
          <Select
            aria-label={t('notifications.filterLabel')}
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value as 'all' | 'unread')}
            className="w-36 sm:w-40"
          >
            <option value="all">{t('notifications.all')}</option>
            <option value="unread">{t('notifications.unreadOnly')}</option>
          </Select>
        </div>
      </div>
      <section
        aria-label={t('notifications.yours')}
        className="rounded-xl border border-slate-200 bg-white px-3 sm:px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <NotificationList
          notifications={userNotifications}
          onRead={markAsRead}
        />
      </section>
    </PageContainer>
  )
}
