import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const isAdmin = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  return <main className={isAdmin ? 'min-w-0 flex-1 bg-slate-100 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6' : 'min-w-0 flex-1 bg-slate-50 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6'}>{children}</main>
}
