import { Menu } from 'lucide-react'
import { TopbarNotifications } from './TopbarNotifications'
import { UserMenu } from './UserMenu'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useTranslation } from '@/localization/useTranslation'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const isAdmin = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const { t } = useTranslation()

  return (
    <header className={isAdmin ? 'flex min-h-16 items-center justify-between gap-4 border-b border-slate-800 bg-slate-950 px-4 text-white sm:px-6' : 'flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6'}>
      <div className="flex min-w-0 items-center gap-3">
        {isAdmin ? <span className="hidden rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 sm:inline-flex">{t('navigation.adminControl')}</span> : <span className="hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 sm:inline-flex">{t('navigation.workspaceLabel')}</span>}
        <button
          type="button"
          onClick={onMenuClick}
          className={isAdmin ? "rounded-lg p-2 text-slate-300 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 lg:hidden" : "rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 lg:hidden"}
          aria-label={t('navigation.openMenu')}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center gap-1">
        <ThemeSwitcher />
        <LanguageSwitcher />
        <TopbarNotifications />
        <UserMenu />
      </div>
    </header>
  )
}
