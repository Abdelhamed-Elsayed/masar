import { LogOut, UserCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

export function UserMenu() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const currentUser = useAuthStore((state) => state.currentUser)
  const logout = useAuthStore((state) => state.logout)
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const isAdmin = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  const { t, content } = useTranslation()
  const displayName = currentUser ? content(currentUser.fullName) : t('menu.user')

  function handleLogout() {
    setIsOpen(false)
    void logout().finally(() => navigate(ROUTES.LOGIN, { replace: true }))
  }

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    <div ref={menuRef} className="relative ms-2">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${t('menu.accountFor')} ${displayName}`}
        className={isAdmin ? "flex items-center gap-2 rounded-lg p-1.5 text-start hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" : "flex items-center gap-2 rounded-lg p-1.5 text-start hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"}
      >
        <span className={isAdmin ? "flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950" : "flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800"}>
          {currentUser ? content(currentUser.firstName).charAt(0) : '?'}
        </span>
        <span className={isAdmin ? "hidden max-w-32 truncate text-sm font-medium text-white md:block" : "hidden max-w-32 truncate text-sm font-medium text-slate-700 md:block"}>
          {currentUser ? displayName : 'User'}
        </span>
      </button>
      {isOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/10 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="absolute end-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false)
                navigate(ROUTES.PROFILE)
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <UserCircle size={16} aria-hidden="true" /> {t('navigation.profile')}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut size={16} aria-hidden="true" /> {t('menu.logout')}
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
