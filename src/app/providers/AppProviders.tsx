import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuditStore } from '@/store/auditStore'
import { migratePersistedUserIds } from '@/utils/dataStorage'
import { LocaleDocument } from '@/localization/LocaleDocument'
import { ThemeDocument } from '@/localization/ThemeDocument'
import { useTranslation } from '@/localization/useTranslation'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const { t } = useTranslation()
  const initializeSession = useAuthStore((state) => state.initializeSession)
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const hydrateRequests = useRequestStore((state) => state.hydrateForUser)
  const hydrateNotifications = useNotificationStore((state) => state.hydrateForUser)
  const hydrateAudit = useAuditStore((state) => state.hydrate)
  const [initializationError, setInitializationError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isMounted = true
    void (async () => {
      try {
        await migratePersistedUserIds()
        await initializeSession()
        if (isMounted) setInitializationError(false)
      } catch (error) {
        console.error('Masar startup migration failed', error)
        if (isMounted) setInitializationError(true)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [initializeSession, retryCount])

  useEffect(() => {
    void hydrateRequests(currentUserId)
    void hydrateNotifications(currentUserId)
    void hydrateAudit()
  }, [currentUserId, hydrateRequests, hydrateNotifications, hydrateAudit])

  return (
    <>
      <LocaleDocument />
      <ThemeDocument />
      {initializationError ? (
        <main className="grid min-h-svh place-items-center p-5">
          <section className="w-full max-w-lg space-y-4" aria-labelledby="startup-error-heading">
            <h1 id="startup-error-heading" className="text-xl font-semibold text-slate-900">{t('app.startupErrorTitle')}</h1>
            <Alert variant="error">{t('app.startupErrorDescription')}</Alert>
            <Button type="button" onClick={() => setRetryCount((count) => count + 1)}>{t('app.retryStartup')}</Button>
          </section>
        </main>
      ) : children}
    </>
  )
}
