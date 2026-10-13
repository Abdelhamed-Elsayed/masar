import { describe, expect, it, beforeEach } from 'vitest'
import { DEFAULT_ROLE_PERMISSIONS, useDirectoryStore } from './directoryStore'
import { mockUsers, userIds, roleIds } from '@/mock/users'

describe('directory hierarchy protections', () => {
  beforeEach(() => {
    useDirectoryStore.setState({
      users: mockUsers,
      companyOwnerId: userIds.james,
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
    })
  })

  it('rejects a manager cycle', () => {
    const before = useDirectoryStore.getState().users.find((user) => user.id === userIds.adam)?.managerId
    useDirectoryStore.getState().upsertUser({ ...mockUsers[0], managerId: userIds.adam })
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.adam)?.managerId).toBe(before)
  })

  it('protects the company owner from deactivation or CEO removal', () => {
    const owner = useDirectoryStore.getState().users.find((user) => user.id === userIds.james)!
    useDirectoryStore.getState().upsertUser({ ...owner, isActive: false, roleIds: owner.roleIds.filter((id) => id !== roleIds.ceo) })
    const saved = useDirectoryStore.getState().users.find((user) => user.id === userIds.james)!
    expect(saved.isActive).toBe(true)
    expect(saved.roleIds).toContain(roleIds.ceo)
  })

  it('preserves CEO management access when saved role permissions are missing', () => {
    useDirectoryStore.setState({
      users: mockUsers,
      companyOwnerId: userIds.james,
      rolePermissions: { [roleIds.ceo]: [] },
    })
    const { hasPermission } = useDirectoryStore.getState()

    expect(hasPermission(userIds.james, 'company.manage')).toBe(true)
    expect(hasPermission(userIds.james, 'users.manage')).toBe(true)
    expect(hasPermission(userIds.james, 'departments.manage')).toBe(true)
    expect(hasPermission(userIds.james, 'roles.manage')).toBe(true)
    expect(hasPermission(userIds.adam, 'departments.manage')).toBe(false)
    useDirectoryStore.setState({ rolePermissions: DEFAULT_ROLE_PERMISSIONS })
  })
})
