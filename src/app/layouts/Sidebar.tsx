import {
  Bell,
  ClipboardList,
  FileCheck2,
  FileText,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  Logs,
  Settings2,
  ShieldCheck,
  Users,
  Building2,
  UserCog,
  Inbox,
  Send,
  UserCircle,
  UserCheck,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

interface SidebarProps {
  isOpen: boolean
  onNavigate?: () => void
}

interface NavigationItem {
  to: string
  label: TranslationKey
  icon: typeof LayoutDashboard
}

const primaryItems: NavigationItem[] = [
  { to: ROUTES.DASHBOARD, label: 'navigation.dashboard', icon: LayoutDashboard },
  { to: ROUTES.REQUESTS, label: 'navigation.myRequests', icon: ClipboardList },
  { to: ROUTES.INBOX, label: 'navigation.inbox', icon: Inbox },
  { to: ROUTES.OUTBOX, label: 'navigation.outbox', icon: Send },
  { to: ROUTES.NOTIFICATIONS, label: 'navigation.notifications', icon: Bell },
  { to: ROUTES.PROFILE, label: 'navigation.profile', icon: UserCircle },
  { to: ROUTES.REGISTRATION_APPROVALS, label: 'navigation.registrationApprovals', icon: UserCheck },
]

const adminItems: NavigationItem[] = [
  { to: ROUTES.ADMIN, label: 'navigation.executiveControl', icon: ShieldCheck },
  { to: ROUTES.ADMIN_USERS, label: 'navigation.users', icon: Users },
  { to: ROUTES.ADMIN_STRUCTURE, label: 'navigation.companyStructure', icon: Building2 },
  { to: ROUTES.ADMIN_DEPARTMENTS, label: 'navigation.departments', icon: Building2 },
  { to: ROUTES.ADMIN_ROLES, label: 'navigation.rolesPermissions', icon: UserCog },
  { to: ROUTES.ADMIN_REQUEST_TYPES, label: 'navigation.requestTypes', icon: FileCheck2 },
  { to: ROUTES.ADMIN_FORMS, label: 'navigation.forms', icon: FileText },
  { to: ROUTES.ADMIN_WORKFLOWS, label: 'navigation.workflows', icon: GitBranch },
  { to: ROUTES.ADMIN_AUDIT_LOGS, label: 'navigation.auditLogs', icon: Logs },
]

function NavigationLink({ item, onNavigate }: { item: NavigationItem; onNavigate?: () => void }) {
  const { t } = useTranslation()
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.ADMIN}
      onClick={onNavigate}
      className={({ isActive }) => {
        const auth = useAuthStore.getState()
        const admin = auth.currentUser ? useDirectoryStore.getState().hasPermission(auth.currentUser.id, 'company.manage') : false
        return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${admin ? 'focus-visible:ring-amber-400' : 'focus-visible:ring-teal-600'} ${
          isActive
            ? admin
              ? 'bg-amber-400 font-semibold text-slate-950 shadow-sm'
              : 'bg-teal-50 font-medium text-teal-800'
            : admin
              ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{t(item.label)}</span>
    </NavLink>
  )
}

export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { t } = useTranslation()
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const canManage = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const canReviewRegistrations = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'users.registration.review') : false)

  if (!isOpen) {
    return null
  }

  return (
    <aside className={canManage ? 'masar-admin-sidebar flex w-64 shrink-0 flex-col border-e border-slate-800 bg-slate-950 p-4 text-white' : 'masar-user-sidebar flex w-64 shrink-0 flex-col border-e border-slate-200 bg-white p-4'} aria-label={t('navigation.primary')}>
      <NavLink to={ROUTES.DASHBOARD} aria-label={t('navigation.dashboard')} className="mb-8 flex items-center gap-3 rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
        <span className={canManage ? 'flex size-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950' : 'flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800'}>
          <FolderKanban size={20} aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <span className={canManage ? 'text-lg font-semibold tracking-tight text-white' : 'text-lg font-semibold tracking-tight text-slate-900'}>Masar</span>
          <span className={canManage ? 'text-[10px] font-medium text-amber-300/80' : 'text-[10px] font-medium text-slate-400'}>by Codiksa</span>
        </div>
      </NavLink>
      <nav className="flex flex-1 flex-col gap-1">
        {primaryItems.filter((item) => item.to !== ROUTES.REGISTRATION_APPROVALS || canReviewRegistrations).map((item) => (
          <NavigationLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        {canManage ? (
          <>
            <p className={canManage ? 'mb-1 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-amber-300' : 'mb-1 mt-7 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400'}>
              {t('navigation.administration')}
            </p>
            {adminItems.map((item) => (
              <NavigationLink key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </>
        ) : null}
      </nav>
      <div className={canManage ? 'mt-6 flex items-center gap-2 border-t border-slate-800 px-2 pt-4 text-xs text-slate-400' : 'mt-6 flex items-center gap-2 border-t border-slate-200 px-2 pt-4 text-xs text-slate-500'}>
        <Settings2 size={15} aria-hidden="true" />
        <span>{t('navigation.workspace')}</span>
      </div>
    </aside>
  )
}
