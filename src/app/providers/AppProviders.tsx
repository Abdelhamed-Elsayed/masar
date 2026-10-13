import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuditStore } from '@/store/auditStore'
import { migratePersistedUserIds } from '@/utils/dataStorage'
import { LocaleDocument } from '@/localization/LocaleDocument'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const initializeSession = useAuthStore((state) => state.initializeSession)
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const hydrateRequests = useRequestStore((state) => state.hydrateForUser)
  const hydrateNotifications = useNotificationStore((state) => state.hydrateForUser)
  const hydrateAudit = useAuditStore((state) => state.hydrate)

  useEffect(() => {
    void (async () => {
      await migratePersistedUserIds().catch(() => undefined)
      await initializeSession()
    })()
  }, [initializeSession])

  useEffect(() => {
    void hydrateRequests(currentUserId)
    void hydrateNotifications(currentUserId)
    void hydrateAudit()
  }, [currentUserId, hydrateRequests, hydrateNotifications, hydrateAudit])

  return (
    <>
      <LocaleDocument />
      {children}
    </>
  )
}
