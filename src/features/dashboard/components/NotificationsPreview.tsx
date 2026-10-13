import { ArrowRight, Bell, Circle } from 'lucide-react'
import { Link } from 'react-router'
import { Card } from '@/components/ui'
import { inboxDetailsPath, ROUTES, requestDetailsPath } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationType } from '@/types/notification'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

function formatRelativeDate(value: string, locale: 'en' | 'ar', t: (key: TranslationKey) => string): string {
  const timestamp = new Date(value).getTime()
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)),
  )

  if (elapsedDays === 0) return t('date.today')
  if (elapsedDays === 1) return t('date.yesterday')
  if (elapsedDays < 7) {
    const days = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(elapsedDays)
    return locale === 'ar' ? `${days} ${t('date.daysAgo')}` : `${days} ${t('date.daysAgo')} ago`
  }
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function NotificationsPreview() {
  const { t, locale, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const notifications = useNotificationStore((state) => state.notifications)
  const userNotifications = currentUser
    ? notifications
        .filter((notification) => notification.userId === currentUser.id)
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 4)
    : []

  return (
    <Card as="section" aria-labelledby="notifications-preview-heading" className="p-5">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Bell aria-hidden="true" className="size-4 text-slate-500" />
          <h2
            id="notifications-preview-heading"
            className="text-base font-semibold text-slate-950"
          >
            {t('dashboard.notifications')}
          </h2>
        </div>
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="inline-flex min-w-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900 sm:shrink-0"
        >
          <span className="break-words">{t('dashboard.viewAllNotifications')}</span>
          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </Link>
      </div>
      {userNotifications.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          {t('dashboard.noNotifications')}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {userNotifications.map((notification) => {
            const href = notification.requestId
              ? notification.type === NotificationType.NEW_ACTION_REQUIRED
                ? inboxDetailsPath(notification.requestId)
                : requestDetailsPath(notification.requestId)
              : ROUTES.NOTIFICATIONS

            return (
              <li key={notification.id} className="py-3 first:pt-1 last:pb-0">
                <Link
                  to={href}
                  className="flex items-start gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="mt-1.5 flex size-3 shrink-0 items-center justify-center">
                    {notification.isRead ? (
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-slate-300" />
                    ) : (
                      <Circle
                        aria-hidden="true"
                        className="size-2 fill-blue-600 text-blue-600"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {content(notification.title)}
                      {!notification.isRead ? (
                        <span className="sr-only"> ({t('dashboard.unread')})</span>
                      ) : null}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                      {content(notification.body)}
                    </span>
                    <time
                      dateTime={notification.createdAt}
                      className="mt-1 block text-xs text-slate-400"
                    >
                      {formatRelativeDate(notification.createdAt, locale, t)}
                    </time>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
