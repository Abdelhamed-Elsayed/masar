import { Bell, ClipboardList, Home, Inbox, Plus } from 'lucide-react'
import { NavLink } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationBadge } from '@/features/notifications'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

const items = [
  { to: ROUTES.DASHBOARD, label: 'navigation.home', icon: Home },
  { to: ROUTES.REQUESTS, label: 'navigation.requests', icon: ClipboardList },
  { to: ROUTES.REQUESTS_NEW, label: 'navigation.new', icon: Plus, action: true },
  { to: ROUTES.INBOX, label: 'navigation.inbox', icon: Inbox },
  { to: ROUTES.NOTIFICATIONS, label: 'navigation.alerts', icon: Bell },
] satisfies { to: string; label: TranslationKey; icon: typeof Home; action?: boolean }[]

export function MobileNav() {
  const { t } = useTranslation()
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const isAdmin = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = currentUserId
    ? notifications.filter((notification) => notification.userId === currentUserId && !notification.isRead).length
    : 0

  return (
    <nav aria-label={t('navigation.mobile')} className={`fixed inset-x-0 bottom-0 z-30 border-t px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden ${isAdmin ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(({ to, label, icon: Icon, action }) => (
          <NavLink key={to} to={to} className="group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold">
            {({ isActive }) => (
              <>
                <span className={`relative flex size-8 items-center justify-center rounded-xl transition ${action ? (isAdmin ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-teal-700 text-white shadow-sm') : isActive ? (isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-teal-50 text-teal-800') : (isAdmin ? 'text-slate-400' : 'text-slate-500')}`}>
                  <Icon size={17} aria-hidden="true" />
                  {to === ROUTES.NOTIFICATIONS ? (
                    <NotificationBadge count={unreadCount} className="-end-1.5 -top-1" />
                  ) : null}
                </span>
                <span className={isActive ? (isAdmin ? 'text-amber-300' : 'text-teal-800') : (isAdmin ? 'text-slate-400' : 'text-slate-500')}>{t(label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
