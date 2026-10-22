export const ROUTES = {
  HOME: '/',
  COMPANY: '/company',
  WELCOME: '/welcome',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTRATION_WAITING: '/registration-waiting',
  DASHBOARD: '/dashboard',
  REQUESTS: '/requests',
  REQUESTS_NEW: '/requests/new',
  REQUEST_DETAILS: '/requests/:id',
  INBOX: '/inbox',
  INBOX_DETAILS: '/inbox/:id',
  OUTBOX: '/outbox',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  REGISTRATION_APPROVALS: '/registration-approvals',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_STRUCTURE: '/admin/company-structure',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_REQUEST_TYPES: '/admin/request-types',
  ADMIN_FORMS: '/admin/forms',
  ADMIN_WORKFLOWS: '/admin/workflows',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_HEALTH: '/admin/system-health',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export function requestDetailsPath(id: string): string {
  return `/requests/${id}`
}

export function inboxDetailsPath(id: string): string {
  return `/inbox/${id}`
}
