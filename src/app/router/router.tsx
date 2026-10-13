import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { Spinner } from '@/components/ui'
import { AdminRoute, GuestRoute, ProtectedRoute, RegistrationReviewRoute } from './guards'
import { ROUTES } from '@/constants/routes'
import { WelcomePage } from '@/pages/WelcomePage'
import { AppLayout } from './lazyLayouts'
import {
  AdminAuditLogsPage,
  AdminSystemHealthPage,
  AdminDepartmentsPage,
  AdminFormsPage,
  AdminHomePage,
  AdminRequestTypesPage,
  AdminRolesPage,
  AdminUsersPage,
  AdminCompanyStructurePage,
  AdminWorkflowsPage,
  DashboardPage,
  InboxDetailsPage,
  InboxPage,
  LoginPage,
  NewRequestPage,
  NotificationsPage,
  NotFoundPage,
  OutboxPage,
  ProfilePage,
  RegisterPage,
  RegistrationApprovalsPage,
  RequestDetailsPage,
  RequestsPage,
} from './lazyPages'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/', element: <WelcomePage /> },
          { path: ROUTES.WELCOME, element: <WelcomePage /> },
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.REGISTER, element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <Suspense fallback={<div className="grid min-h-svh place-items-center"><Spinner size="lg" label="Loading workspace" /></div>}>
            <AppLayout />
          </Suspense>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'requests', element: <RequestsPage /> },
          { path: 'requests/new', element: <NewRequestPage /> },
          { path: 'requests/:id', element: <RequestDetailsPage /> },
          { path: 'inbox', element: <InboxPage /> },
          { path: 'inbox/:id', element: <InboxDetailsPage /> },
          { path: 'outbox', element: <OutboxPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { element: <RegistrationReviewRoute />, children: [{ path: 'registration-approvals', element: <RegistrationApprovalsPage /> }] },
          {
            element: <AdminRoute />,
            children: [
              { path: 'admin', element: <AdminHomePage /> },
              { path: 'admin/users', element: <AdminUsersPage /> },
              { path: 'admin/company-structure', element: <AdminCompanyStructurePage /> },
              { path: 'admin/departments', element: <AdminDepartmentsPage /> },
              { path: 'admin/roles', element: <AdminRolesPage /> },
              { path: 'admin/request-types', element: <AdminRequestTypesPage /> },
              { path: 'admin/forms', element: <AdminFormsPage /> },
              { path: 'admin/workflows', element: <AdminWorkflowsPage /> },
              { path: 'admin/audit-logs', element: <AdminAuditLogsPage /> },
              { path: 'admin/system-health', element: <AdminSystemHealthPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
