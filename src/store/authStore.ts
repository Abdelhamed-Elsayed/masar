import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, Role } from '@/types/auth'
import type { User } from '@/types/user'
import { demoCredentials, mockUsers, roleIds } from '@/mock/users'
import { normalizeLegacyUserId } from '@/mock/legacyUserIdMigration'
import { useDirectoryStore } from './directoryStore'
import { createNotification, useNotificationStore } from './notificationStore'

interface StoredCredential { userId: string; password: string }

interface AuthState {
  currentUser: User | null
  roles: Role[]
  isInitializing: boolean
  initializeSession: () => Promise<void>
  login: (email: string, password: string) => Promise<string | null>
  registerPendingUser: (user: User, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setPassword: (userId: string, password: string) => Promise<void>
  removePassword: (userId: string) => void
}

const CREDENTIALS_KEY = 'masar-local-credentials'
const DEMO_CREDENTIALS_VERSION_KEY = 'masar-demo-credentials-version'
const DEMO_CREDENTIALS_VERSION = 5

export const DEMO_PASSWORDS = demoCredentials

function readCredentials(): StoredCredential[] {
  const raw = localStorage.getItem(CREDENTIALS_KEY)
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Saved credentials are unreadable. Refusing to overwrite them.')
  }
  if (!Array.isArray(parsed) || !parsed.every(isStoredCredential)) {
    throw new Error('Saved credentials have an invalid format. Refusing to overwrite them.')
  }
  return parsed
}

function isStoredCredential(value: unknown): value is StoredCredential {
  if (typeof value !== 'object' || value === null) return false
  const credential = value as Record<string, unknown>
  return typeof credential.userId === 'string' && typeof credential.password === 'string'
}

function writeCredentials(credentials: StoredCredential[]) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
}

function migrateCredentialUserIds() {
  const credentials = readCredentials()
  const normalized = new Map<string, StoredCredential>()
  for (const credential of credentials) {
    const userId = normalizeLegacyUserId(credential.userId) ?? credential.userId
    // Prefer an already-normalized record if both old and new IDs exist.
    if (!normalized.has(userId) || credential.userId === userId) normalized.set(userId, { ...credential, userId })
  }
  writeCredentials(Array.from(normalized.values()))
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return `sha256:${Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

async function verifyPassword(password: string, stored: string): Promise<{ valid: boolean; legacy: boolean }> {
  if (!stored.startsWith('sha256:')) return { valid: stored === password, legacy: true }
  return { valid: (await hashPassword(password)) === stored, legacy: false }
}

function getRoles(user: User): Role[] {
  const roles = useDirectoryStore.getState().roles
  return roles.filter((role) => user.roleIds.includes(role.id))
}

async function seedDemoCredentials() {
  migrateCredentialUserIds()
  const existing = readCredentials()
  const seeded = [...existing]

  for (const user of mockUsers) {
    const demoPassword = DEMO_PASSWORDS[user.id]
    if (!demoPassword) throw new Error(`Missing demo password for seeded user ${user.id}.`)
    const hashed = await hashPassword(demoPassword)
    const index = seeded.findIndex((item) => item.userId === user.id)
    if (index === -1) {
      seeded.push({ userId: user.id, password: hashed })
    }
  }

  writeCredentials(seeded)
  localStorage.setItem(DEMO_CREDENTIALS_VERSION_KEY, String(DEMO_CREDENTIALS_VERSION))
}


async function thisHashAndStore(userId: string, password: string): Promise<void> {
  const credentials = readCredentials()
  const hashed = await hashPassword(password)
  const next = credentials.some((item) => item.userId === userId)
    ? credentials.map((item) => item.userId === userId ? { ...item, password: hashed } : item)
    : [...credentials, { userId, password: hashed }]
  writeCredentials(next)
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      roles: [],
      isInitializing: true,
      initializeSession: async () => {
        await seedDemoCredentials()
        const user = useAuthStore.getState().currentUser
        if (user) {
          const directoryUser = useDirectoryStore.getState().users.find((item) => item.id === user.id)
          const effectiveUser = directoryUser ?? user
          if (!effectiveUser.isActive || effectiveUser.approvalStatus === 'REJECTED' || effectiveUser.registrationStage === 'REJECTED') {
            set({ currentUser: null, roles: [], isInitializing: false })
          } else {
            set({ currentUser: effectiveUser, roles: getRoles(effectiveUser), isInitializing: false })
          }
        } else {
          set({ isInitializing: false })
        }
      },
      login: async (email, password) => {
        await seedDemoCredentials()
        const user = useDirectoryStore.getState().users.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
        )
        if (!user) return 'INVALID_CREDENTIALS'
        if (user.approvalStatus === 'REJECTED' || user.registrationStage === 'REJECTED') return 'REGISTRATION_REJECTED'
        if (user.approvalStatus === 'PENDING') return 'PENDING_APPROVAL'
        if (!user.isActive) return 'INACTIVE_ACCOUNT'
        const credential = readCredentials().find((item) => item.userId === user.id)
        if (!credential) return 'INVALID_CREDENTIALS'
        const verification = await verifyPassword(password, credential.password)
        if (!verification.valid) return 'INVALID_CREDENTIALS'
        if (verification.legacy) {
          const upgraded = await hashPassword(password)
          writeCredentials(readCredentials().map((item) => item.userId === user.id ? { ...item, password: upgraded } : item))
        }
        const roles = getRoles(user)
        set({ currentUser: user, roles, isInitializing: false })
        return null
      },
      registerPendingUser: async (user, password) => {
        const directory = useDirectoryStore.getState()
        const users = directory.users
        if (users.some((item) => item.email.toLowerCase() === user.email.toLowerCase())) return false
        if (!directory.departments.some((department) => department.id === user.departmentId)) return false
        const department = directory.departments.find((item) => item.id === user.departmentId)
        if (!department?.headUserId || !users.some((item) => item.id === department.headUserId && item.isActive)) return false
        const hrReviewers = users.filter((item) => item.isActive && item.roleIds.includes(roleIds.hr))
        if (hrReviewers.length === 0) return false
        directory.upsertUser({ ...user, isActive: false, approvalStatus: 'PENDING', registrationStage: 'HR_REVIEW' })
        await thisHashAndStore(user.id, password)
        for (const reviewer of hrReviewers) {
          useNotificationStore.getState().addNotification(createNotification({ userId: reviewer.id, type: 'NEW_ACTION_REQUIRED', title: 'New registration requires HR review', body: `${user.fullName} submitted a new account request for ${user.jobTitle}.`, requestId: null }))
        }
        return true
      },
      logout: async () => {
        set({ currentUser: null, roles: [] })
      },
      setPassword: async (userId, password) => {
        await thisHashAndStore(userId, password)
      },
      removePassword: (userId) => {
        writeCredentials(readCredentials().filter((item) => item.userId !== userId))
      },
    }),
    {
      name: 'masar-auth',
      version: 5,
      migrate: (persisted) => {
        const state = persisted as Partial<AuthState>
        const persistedUser = state.currentUser
        const normalizedId = persistedUser ? normalizeLegacyUserId(persistedUser.id) ?? persistedUser.id : null
        // Seeded accounts always take their display identity (name, avatar) from the
        // current directory, so a session saved by an older build never keeps a stale
        // name or a removed avatar file.
        const seeded = normalizedId ? mockUsers.find((user) => user.id === normalizedId) : undefined
        const currentUser = persistedUser
          ? {
              ...persistedUser,
              id: normalizedId ?? persistedUser.id,
              managerId: normalizeLegacyUserId(persistedUser.managerId) ?? null,
              ...(seeded
                ? { firstName: seeded.firstName, lastName: seeded.lastName, fullName: seeded.fullName, avatarUrl: seeded.avatarUrl }
                : {}),
            }
          : null
        const roles: Role[] = Array.isArray(state.roles) ? state.roles.filter(Boolean) : []
        return { currentUser, roles }
      },
      partialize: (state) => ({ currentUser: state.currentUser, roles: state.roles }),
    },
  ),
)

export type { AuthSession }
