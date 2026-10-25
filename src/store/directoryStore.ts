import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockDepartments } from '@/mock/departments'
import { mockRoles, mockUsers, roleIds, userIds } from '@/mock/users'
import { normalizeLegacyUserId } from '@/mock/legacyUserIdMigration'
import { mockRequestTypes } from '@/mock/workflows'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { RequestType } from '@/types/request'
import type { User, RegistrationStage } from '@/types/user'
import { useAuditStore } from './auditStore'
import { useNotificationStore, createNotification } from './notificationStore'

export interface RolePermissions {
  [roleId: string]: string[]
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  'role-employee': ['requests.create', 'requests.read'],
  'role-manager': ['requests.create', 'requests.read', 'requests.approve'],
  'role-hr': ['requests.read', 'requests.approve', 'users.registration.review'],
  'role-department-head': ['requests.read', 'requests.approve', 'users.registration.review'],
  'role-ceo-representative': ['requests.read', 'requests.approve'],
  'role-admin': ['requests.create', 'requests.read', 'requests.approve', 'users.manage', 'users.promote', 'users.registration.review', 'settings.manage', 'departments.manage', 'roles.manage', 'workflows.manage', 'audit.read'],
  'role-ceo': ['requests.create', 'requests.read', 'requests.approve', 'users.manage', 'users.promote', 'users.registration.review', 'settings.manage', 'company.manage', 'departments.manage', 'roles.manage', 'workflows.manage', 'audit.read'],
  'role-approver': ['requests.read', 'requests.approve'],
}

const CEO_CORE_PERMISSIONS = new Set<string>([
  'company.manage',
  'users.manage',
  'users.promote',
  'users.registration.review',
  'departments.manage',
  'roles.manage',
  'workflows.manage',
  'settings.manage',
  'audit.read',
])

interface DirectoryState {
  users: User[]
  departments: Department[]
  roles: Role[]
  requestTypes: RequestType[]
  rolePermissions: RolePermissions
  companyOwnerId: string
  setCompanyOwner: (userId: string) => void
  setPublicProfileVisibility: (userId: string, actorId: string, visible: boolean) => boolean
  upsertUser: (user: User) => void
  removeUser: (userId: string) => void
  upsertDepartment: (department: Department) => void
  upsertRequestType: (requestType: RequestType) => void
  setRolePermission: (roleId: string, permissionId: string, allowed: boolean) => void
  hasPermission: (userId: string, permissionId: string) => boolean
  promoteUser: (userId: string, actorId: string, roleIds: string[], jobTitle?: string) => boolean
  updateUserProfile: (userId: string, actorId: string, profile: import('@/types/user').UserProfileData) => boolean
  approveRegistrationByHr: (userId: string, actorId: string, note?: string) => boolean
  rejectRegistrationByHr: (userId: string, actorId: string, note: string) => boolean
  approveRegistrationByDepartmentHead: (userId: string, actorId: string, note?: string) => boolean
  rejectRegistrationByDepartmentHead: (userId: string, actorId: string, note: string) => boolean
  finalizeRegistrationByCeo: (userId: string, actorId: string, input: { jobTitle: string; departmentId: string; managerId: string | null; roleIds: string[]; note?: string }) => boolean
  rejectRegistrationByCeo: (userId: string, actorId: string, note: string) => boolean
}


function getAuditActorId(): string | null {
  try {
    const raw = localStorage.getItem('masar-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { currentUser?: { id?: string } | null } }
    return parsed.state?.currentUser?.id ?? null
  } catch {
    return null
  }
}

function createsManagerCycle(users: User[], userId: string, managerId: string | null): boolean {
  if (!managerId) return false
  if (managerId === userId) return true
  const visited = new Set<string>()
  let cursor: string | null = managerId
  while (cursor) {
    if (visited.has(cursor)) return true
    visited.add(cursor)
    if (cursor === userId) return true
    cursor = users.find((user) => user.id === cursor)?.managerId ?? null
  }
  return false
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  return items.some((existing) => existing.id === item.id)
    ? items.map((existing) => (existing.id === item.id ? item : existing))
    : [...items, item]
}

/**
 * Gives a saved profile the seeded Arabic/English versions it is missing. Anything the
 * user already saved for a language wins, so edits are never overwritten.
 */
function mergeSeedProfile(saved: User['profile'], seeded: User['profile']): User['profile'] {
  if (!seeded) return saved
  if (!saved) return seeded
  const merged: NonNullable<User['profile']> = { ...saved }
  const localized: NonNullable<typeof saved.localized> = {}
  for (const locale of ['ar', 'en'] as const) {
    localized[locale] = { ...seeded.localized?.[locale], ...saved.localized?.[locale] }
  }
  // A base bio/skills list changed from the seed means an older edit: keep it for Arabic.
  if (saved.bio !== seeded.bio && !saved.localized?.ar?.bio && localized.ar) localized.ar.bio = saved.bio
  if (saved.skills.join('|') !== seeded.skills.join('|') && !saved.localized?.ar?.skills && localized.ar) localized.ar.skills = saved.skills
  merged.localized = localized
  return merged
}

export const useDirectoryStore = create<DirectoryState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      departments: mockDepartments,
      roles: mockRoles,
      requestTypes: mockRequestTypes,
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      companyOwnerId: userIds.abdelhamid,
      setPublicProfileVisibility: (userId, actorId, visible) => {
        const user = get().users.find((item) => item.id === userId)
        if (!user || actorId !== userId || !user.isActive) return false
        set((state) => ({
          users: state.users.map((item) => item.id === userId ? { ...item, publicProfileVisible: visible } : item),
        }))
        useAuditStore.getState().addEntry({
          action: visible ? 'Public profile enabled' : 'Public profile disabled',
          actorId,
          targetId: userId,
          targetType: 'user',
          details: 'Company website profile visibility changed',
        })
        return true
      },
      setCompanyOwner: (userId) => {
        const ownerRoleId = roleIds.ceo
        const state = get()
        const owner = state.users.find((user) => user.id === userId)
        if (!owner || !owner.isActive) return
        set((current) => ({
          companyOwnerId: userId,
          users: current.users.map((user) => user.id === userId
            ? {
                ...user,
                roleIds: user.roleIds.includes(ownerRoleId) ? user.roleIds : [...user.roleIds, ownerRoleId],
                jobTitle: 'CEO & Company Owner',
                departmentId: current.departments.find((department) => department.code === 'EXE')?.id ?? user.departmentId,
                managerId: null,
                isActive: true,
                approvalStatus: 'APPROVED',
              }
            : { ...user, roleIds: user.roleIds.filter((roleId) => roleId !== ownerRoleId) }),
        }))
        useAuditStore.getState().addEntry({ action: 'Company owner changed', actorId: getAuditActorId(), targetId: userId, targetType: 'company', details: `${owner.fullName} is now CEO & Company Owner` })
      },
      upsertUser: (user) => {
        const state = get()
        const existing = state.users.find((item) => item.id === user.id)
        const exists = Boolean(existing)
        if (createsManagerCycle(state.users, user.id, user.managerId)) return
        if (user.managerId && !state.users.some((item) => item.id === user.managerId)) return
        if (user.departmentId && !state.departments.some((item) => item.id === user.departmentId)) return
        // A rejected registration is a terminal access state. Editing its profile
        // must never accidentally reactivate or approve the account. A dedicated
        // re-open/re-registration flow can change this state later.
        const nextUser = {
          ...user,
          publicProfileVisible: existing?.publicProfileVisible,
          ...(existing?.registrationStage === 'REJECTED'
            ? { isActive: false, approvalStatus: 'REJECTED' as const, registrationStage: 'REJECTED' as RegistrationStage, registrationDecisionNote: existing.registrationDecisionNote }
            : {}),
        }
        if (state.companyOwnerId === nextUser.id && !nextUser.isActive) return
        if (state.companyOwnerId === nextUser.id && !nextUser.roleIds.includes(roleIds.ceo)) return
        set((current) => ({ users: upsertById(current.users, nextUser) }))
        useAuditStore.getState().addEntry({ action: exists ? 'User updated' : 'User created', actorId: getAuditActorId(), targetId: nextUser.id, targetType: 'user', details: nextUser.email })
      },
      removeUser: (userId) => {
        const state = get()
        if (userId === state.companyOwnerId) return
        if (state.users.some((user) => user.managerId === userId)) return
        set((current) => ({ users: current.users.filter((user) => user.id !== userId) }))
        useAuditStore.getState().addEntry({ action: 'User removed', actorId: getAuditActorId(), targetId: userId, targetType: 'user', details: userId })
      },
      upsertDepartment: (department) => {
        const exists = get().departments.some((item) => item.id === department.id)
        set((state) => ({ departments: upsertById(state.departments, department) }))
        useAuditStore.getState().addEntry({ action: exists ? 'Department updated' : 'Department created', actorId: getAuditActorId(), targetId: department.id, targetType: 'department', details: department.name })
      },
      upsertRequestType: (requestType) => {
        const exists = get().requestTypes.some((item) => item.id === requestType.id)
        set((state) => ({ requestTypes: upsertById(state.requestTypes, requestType) }))
        useAuditStore.getState().addEntry({ action: exists ? 'Request type updated' : 'Request type created', actorId: getAuditActorId(), targetId: requestType.id, targetType: 'request-type', details: requestType.name })
      },
      setRolePermission: (roleId, permissionId, allowed) => set((state) => {
        const assigned = state.rolePermissions[roleId] ?? []
        const next = allowed
          ? assigned.includes(permissionId) ? assigned : [...assigned, permissionId]
          : assigned.filter((id) => id !== permissionId)
        return { rolePermissions: { ...state.rolePermissions, [roleId]: next } }
      }),
      hasPermission: (userId, permissionId) => {
        const state = get()
        const user = state.users.find((item) => item.id === userId)
        if (!user) return false
        if (userId === state.companyOwnerId && CEO_CORE_PERMISSIONS.has(permissionId)) return true
        return user.roleIds.some((roleId) => (state.rolePermissions[roleId] ?? []).includes(permissionId))
      },
      approveRegistrationByHr: (userId, actorId, note) => {
        const state = get()
        const actor = state.users.find((user) => user.id === actorId)
        const user = state.users.find((item) => item.id === userId)
        if (!actor || !user || !state.hasPermission(actorId, 'users.registration.review')) return false
        if (!actor.roleIds.includes(roleIds.hr) || user.registrationStage !== 'HR_REVIEW') return false
        const next = { ...user, registrationStage: 'DEPARTMENT_HEAD_REVIEW' as RegistrationStage, approvalStatus: 'PENDING' as const, registrationDecisionNote: note?.trim() || undefined }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration approved by HR', actorId, targetId: userId, targetType: 'user', details: note?.trim() || user.email })
        const department = state.departments.find((item) => item.id === user.departmentId)
        if (department?.headUserId) useNotificationStore.getState().addNotification(createNotification({ userId: department.headUserId, type: 'NEW_ACTION_REQUIRED', title: 'Registration awaiting department approval', body: `${user.fullName} passed HR review and needs department-head approval.`, requestId: null }))
        return true
      },
      rejectRegistrationByHr: (userId, actorId, note) => {
        const state = get(); const actor = state.users.find((user) => user.id === actorId); const user = state.users.find((item) => item.id === userId)
        if (!actor || !user || !state.hasPermission(actorId, 'users.registration.review') || !actor.roleIds.includes(roleIds.hr) || user.registrationStage !== 'HR_REVIEW' || !note.trim()) return false
        const next = { ...user, registrationStage: 'REJECTED' as RegistrationStage, approvalStatus: 'REJECTED' as const, isActive: false, registrationDecisionNote: note.trim() }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration rejected by HR', actorId, targetId: userId, targetType: 'user', details: note.trim() })
        useNotificationStore.getState().addNotification(createNotification({ userId, type: 'REQUEST_REJECTED', title: 'Registration rejected by HR', body: note.trim(), requestId: null }))
        return true
      },
      approveRegistrationByDepartmentHead: (userId, actorId, note) => {
        const state = get(); const actor = state.users.find((user) => user.id === actorId); const user = state.users.find((item) => item.id === userId); const department = user ? state.departments.find((item) => item.id === user.departmentId) : undefined
        if (!actor || !user || !department || !state.hasPermission(actorId, 'users.registration.review') || department.headUserId !== actorId || user.registrationStage !== 'DEPARTMENT_HEAD_REVIEW') return false
        const next = { ...user, registrationStage: 'CEO_REVIEW' as RegistrationStage, approvalStatus: 'PENDING' as const, registrationDecisionNote: note?.trim() || undefined }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration approved by department head', actorId, targetId: userId, targetType: 'user', details: note?.trim() || user.email })
        useNotificationStore.getState().addNotification(createNotification({ userId: state.companyOwnerId, type: 'NEW_ACTION_REQUIRED', title: 'Registration awaiting CEO decision', body: `${user.fullName} passed department-head review and is ready for position assignment.`, requestId: null }))
        return true
      },
      rejectRegistrationByDepartmentHead: (userId, actorId, note) => {
        const state = get(); const actor = state.users.find((user) => user.id === actorId); const user = state.users.find((item) => item.id === userId); const department = user ? state.departments.find((item) => item.id === user.departmentId) : undefined
        if (!actor || !user || !department || !state.hasPermission(actorId, 'users.registration.review') || department.headUserId !== actorId || user.registrationStage !== 'DEPARTMENT_HEAD_REVIEW' || !note.trim()) return false
        const next = { ...user, registrationStage: 'REJECTED' as RegistrationStage, approvalStatus: 'REJECTED' as const, isActive: false, registrationDecisionNote: note.trim() }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration rejected by department head', actorId, targetId: userId, targetType: 'user', details: note.trim() })
        useNotificationStore.getState().addNotification(createNotification({ userId, type: 'REQUEST_REJECTED', title: 'Registration rejected by department head', body: note.trim(), requestId: null }))
        return true
      },
      finalizeRegistrationByCeo: (userId, actorId, input) => {
        const state = get(); const user = state.users.find((item) => item.id === userId)
        if (!user || actorId !== state.companyOwnerId || user.registrationStage !== 'CEO_REVIEW' || !input.jobTitle.trim() || !state.departments.some((item) => item.id === input.departmentId)) return false
        if (input.managerId && !state.users.some((item) => item.id === input.managerId)) return false
        if (createsManagerCycle(state.users, userId, input.managerId)) return false
        const next = { ...user, departmentId: input.departmentId, managerId: input.managerId, roleIds: input.roleIds.length ? input.roleIds : [roleIds.employee], jobTitle: input.jobTitle.trim(), isActive: true, approvalStatus: 'APPROVED' as const, registrationStage: 'APPROVED' as RegistrationStage, registrationDecisionNote: input.note?.trim() || undefined }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration finalized by CEO', actorId, targetId: userId, targetType: 'user', details: `${next.jobTitle} / ${state.departments.find((item) => item.id === next.departmentId)?.name ?? ''}` })
        useNotificationStore.getState().addNotification(createNotification({ userId, type: 'FINAL_DECISION', title: 'Account approved', body: `Your Masar account is approved. Your new position is ${next.jobTitle}.`, requestId: null }))
        return true
      },
      rejectRegistrationByCeo: (userId, actorId, note) => {
        const state = get()
        const user = state.users.find((item) => item.id === userId)
        if (!user || actorId !== state.companyOwnerId || user.registrationStage !== 'CEO_REVIEW' || !note.trim()) return false
        const next = { ...user, registrationStage: 'REJECTED' as RegistrationStage, approvalStatus: 'REJECTED' as const, isActive: false, registrationDecisionNote: note.trim() }
        set((current) => ({ users: current.users.map((item) => item.id === userId ? next : item) }))
        useAuditStore.getState().addEntry({ action: 'Registration rejected by CEO', actorId, targetId: userId, targetType: 'user', details: note.trim() })
        useNotificationStore.getState().addNotification(createNotification({ userId, type: 'REQUEST_REJECTED', title: 'Registration rejected by CEO', body: note.trim(), requestId: null }))
        return true
      },
      promoteUser: (userId, actorId, newRoleIds, newJobTitle) => {
        const state = get()
        const user = state.users.find((item) => item.id === userId)
        const isCeo = actorId === state.companyOwnerId || state.hasPermission(actorId, 'company.manage') || state.hasPermission(actorId, 'users.promote')
        if (!user || !isCeo) return false

        const safeRoleIds = newRoleIds.includes(roleIds.ceo) && userId !== state.companyOwnerId
          ? newRoleIds.filter((id) => id !== roleIds.ceo)
          : newRoleIds

        const updated = {
          ...user,
          roleIds: safeRoleIds.length ? safeRoleIds : [roleIds.employee],
          jobTitle: newJobTitle && newJobTitle.trim() ? newJobTitle.trim() : user.jobTitle,
        }

        set((current) => ({
          users: current.users.map((item) => (item.id === userId ? updated : item)),
        }))

        useAuditStore.getState().addEntry({
          action: 'User promoted by CEO',
          actorId,
          targetId: userId,
          targetType: 'user',
          details: `Roles: ${updated.roleIds.join(', ')} | JobTitle: ${updated.jobTitle}`,
        })

        useNotificationStore.getState().addNotification(
          createNotification({
            userId,
            type: 'FINAL_DECISION',
            title: 'Promotion / Role Update',
            body: `Your organizational role and position have been updated by the CEO: ${updated.jobTitle}.`,
            requestId: null,
          }),
        )
        return true
      },
      updateUserProfile: (userId, actorId, profile) => {
        const state = get()
        const user = state.users.find((item) => item.id === userId)
        const isAdminOrCeo = actorId === state.companyOwnerId || state.hasPermission(actorId, 'users.manage') || state.hasPermission(actorId, 'company.manage')
        if (!user || !isAdminOrCeo) return false

        const updated = {
          ...user,
          profile,
        }

        set((current) => ({
          users: current.users.map((item) => (item.id === userId ? updated : item)),
        }))

        useAuditStore.getState().addEntry({
          action: 'Employee profile updated by Admin',
          actorId,
          targetId: userId,
          targetType: 'user',
          details: `Updated profile details for ${user.fullName}`,
        })

        return true
      },
    }),
    {
      name: 'masar-directory',
      version: 10,
      migrate: (persisted) => {
        const state = persisted as Partial<DirectoryState>
        const roles = [...(state.roles ?? mockRoles)]
        if (!roles.some((role) => role.id === roleIds.ceo)) {
          roles.push(mockRoles.find((role) => role.id === roleIds.ceo)!)
        }
        const companyOwnerId = normalizeLegacyUserId(state.companyOwnerId) ?? userIds.abdelhamid
        const persistedPermissions = state.rolePermissions ?? {}
        const rolePermissions = Object.fromEntries(Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([roleId, defaults]) => [roleId, Array.from(new Set([...(persistedPermissions[roleId] ?? []), ...defaults]))])) as RolePermissions

        // Migrate persisted default identities from legacy IDs to IDs derived from
        // the current names/emails. Relationships (manager, department head, owner)
        // are remapped at the same time so requests/workflows keep pointing to the
        // same people after the identity rename.
        const currentUserById = new Map(mockUsers.map((user) => [user.id, user]))
        const existingUsers = state.users ?? mockUsers
        const migratedUsers = existingUsers.map((user) => {
          const normalizedId = normalizeLegacyUserId(user.id) ?? user.id
          const normalizedManagerId = normalizeLegacyUserId(user.managerId) ?? null
          const seededUser = currentUserById.get(normalizedId)
          return seededUser
            ? {
                ...user,
                id: normalizedId,
                firstName: seededUser.firstName,
                lastName: seededUser.lastName,
                fullName: seededUser.fullName,
                email: seededUser.email,
                employeeId: seededUser.employeeId,
                jobTitle: seededUser.jobTitle,
                departmentId: seededUser.departmentId,
                avatarUrl: seededUser.avatarUrl,
                profile: mergeSeedProfile(user.profile, seededUser.profile),
                publicProfileVisible: user.publicProfileVisible ?? seededUser.publicProfileVisible,
                managerId: seededUser.managerId,
              }
            : { ...user, id: normalizedId, managerId: normalizedManagerId }
        })
        const knownUserIds = new Set(migratedUsers.map((user) => user.id))
        const usersWithNewAccounts = [
          ...migratedUsers,
          ...mockUsers.filter((user) => !knownUserIds.has(user.id)),
        ]
        const users = Array.from(new Map(usersWithNewAccounts.map((user) => [user.id, user])).values()).map((user) => {
          const stage = user.registrationStage ?? (user.approvalStatus === 'APPROVED' || user.isActive ? 'APPROVED' : 'HR_REVIEW')
          return user.id === companyOwnerId
            ? { ...user, registrationStage: 'APPROVED' as RegistrationStage, roleIds: user.roleIds.includes(roleIds.ceo) ? user.roleIds : [...user.roleIds, roleIds.ceo], jobTitle: 'CEO & Company Owner' }
            : { ...user, registrationStage: stage as RegistrationStage, roleIds: user.roleIds.filter((roleId) => roleId !== roleIds.ceo) }
        })
        const existingDepartments = (state.departments ?? mockDepartments).map((department) => ({
          ...department,
          headUserId: normalizeLegacyUserId(department.headUserId) ?? null,
        }))
        const currentDepartmentById = new Map(mockDepartments.map((department) => [department.id, department]))
        const savedDepartmentIds = new Set(existingDepartments.map((department) => department.id))
        const departments = [
          ...existingDepartments.map((department) => {
            const seededDepartment = currentDepartmentById.get(department.id)
            return seededDepartment ? { ...department, ...seededDepartment } : department
          }),
          ...mockDepartments.filter((department) => !savedDepartmentIds.has(department.id)),
        ]
        return { ...state, roles, rolePermissions, users, departments, companyOwnerId }
      },
    },
  ),
)
