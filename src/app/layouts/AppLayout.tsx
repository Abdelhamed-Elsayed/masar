import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { useState } from 'react'
import { Spinner } from '@/components/ui'
import { MainContent } from './MainContent'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { MobileNav } from './MobileNav'
import { useTranslation } from '@/localization/useTranslation'

export function AppLayout() {
  const { t } = useTranslation()
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const companyOwnerId = useDirectoryStore((state) => state.companyOwnerId)
  const isOwner = currentUserId === companyOwnerId
  const canManage = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const isAdmin = isOwner || canManage
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={isOwner ? 'masar-ceo-theme flex min-h-svh bg-slate-50' : isAdmin ? 'masar-admin-theme flex min-h-svh bg-slate-100' : 'masar-user-theme flex min-h-svh bg-slate-50'}>
      <div className="hidden lg:flex">
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button type="button" aria-label={t('navigation.closeMenu')} onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/30" />
          <div className="relative z-10 flex">
            <Sidebar isOpen onNavigate={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => {
            setIsMobileMenuOpen(true)
          }}
        />
        <MainContent>
          <Suspense fallback={<div className="grid min-h-72 place-items-center"><Spinner label="Loading page" /></div>}>
            <Outlet />
          </Suspense>
        </MainContent>
        <MobileNav />
      </div>
    </div>
  )
}
