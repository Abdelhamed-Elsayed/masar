import { beforeEach, describe, expect, it } from 'vitest'
import { mockUsers, userIds } from '@/mock/users'
import { useDirectoryStore } from './directoryStore'
import { useAuthStore } from './authStore'

const CREDENTIALS_KEY = 'masar-local-credentials'
const LEGACY_CEO_ID = 'user-james-anderson'

describe('credential migration after identity changes', () => {
  beforeEach(() => {
    localStorage.removeItem('masar-auth')
    localStorage.removeItem(CREDENTIALS_KEY)
    useAuthStore.setState({ currentUser: null, roles: [], isInitializing: true })
    useDirectoryStore.setState((state) => ({
      ...state,
      users: mockUsers,
    }))
  })

  it('moves a custom legacy credential to the new identity without replacing its password', async () => {
    const savedPassword = 'CustomCeoPassword!42'
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify([
      { userId: LEGACY_CEO_ID, password: savedPassword },
    ]))

    await useAuthStore.getState().initializeSession()

    expect(JSON.parse(localStorage.getItem(CREDENTIALS_KEY) ?? '[]')).toContainEqual({
      userId: userIds.abdelhamid,
      password: savedPassword,
    })
    expect(await useAuthStore.getState().login('abdelhamid@masar.local', savedPassword)).toBeNull()
  })

  it('seeds a credential for the newly added CTO account', async () => {
    await useAuthStore.getState().initializeSession()
    expect(await useAuthStore.getState().login('mahmoud.ayman@masar.local', 'Masar@0111')).toBeNull()
  })

  it('does not overwrite unreadable saved credentials', async () => {
    localStorage.setItem(CREDENTIALS_KEY, '{invalid')

    await expect(useAuthStore.getState().initializeSession()).rejects.toThrow('Refusing to overwrite them')
    expect(localStorage.getItem(CREDENTIALS_KEY)).toBe('{invalid')
  })
})
