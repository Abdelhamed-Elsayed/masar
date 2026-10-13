import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'

export function ProtectedRoute() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  if (isInitializing) return <div className="grid min-h-svh place-items-center"><Spinner size="lg" label="Restoring session" /></div>
  return currentUser ? <Outlet /> : <Navigate to={ROUTES.WELCOME} replace />
}

export function GuestRoute() {
  const location = useLocation()

  // The public entry flow must always remain Welcome → Sign in/Register.
  // A persisted session must never silently skip the welcome/login screen or
  // route a user into an administrative workspace. Protected routes are still
  // guarded by ProtectedRoute, so an authenticated user can safely re-enter
  // the sign-in flow to switch accounts.
  const isPublicEntry = location.pathname === '/'
    || location.pathname === ROUTES.WELCOME
    || location.pathname === ROUTES.LOGIN
    || location.pathname === ROUTES.REGISTER

  return isPublicEntry ? <Outlet /> : <Navigate to={ROUTES.WELCOME} replace />
}

export function AdminRoute() {
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const canManage = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'company.manage') : false)
  return canManage ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />
}

export function RegistrationReviewRoute() {
  const currentUserId = useAuthStore((state) => state.currentUser?.id ?? null)
  const canReview = useDirectoryStore((state) => currentUserId ? state.hasPermission(currentUserId, 'users.registration.review') : false)
  return canReview ? <Outlet /> : <Navigate to={ROUTES.DASHBOARD} replace />
}
