import { describe, expect, it, beforeEach } from 'vitest'
import { DEFAULT_ROLE_PERMISSIONS, useDirectoryStore } from './directoryStore'
import { mockUsers, mockRoles, userIds, roleIds } from '@/mock/users'
import { departmentIds, mockDepartments } from '@/mock/departments'

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

  it('seeds Arabic identities with aligned engineering and development department heads', () => {
    const users = useDirectoryStore.getState().users
    const departments = mockDepartments
    expect(users.map((user) => user.id)).toContain(userIds.abdelhamid)
    expect(users.map((user) => user.id)).toContain(userIds.mahmoudAyman)
    expect(users.find((user) => user.id === userIds.abdelhamid)).toMatchObject({
      fullName: 'Abdelhamid Elsayed',
      email: 'abdelhamid@masar.local',
      jobTitle: 'CEO & Company Owner',
    })
    expect(users.find((user) => user.id === userIds.mahmoudAyman)).toMatchObject({
      fullName: 'محمود أيمن',
      jobTitle: 'Chief Technology Officer',
      departmentId: departmentIds.development,
      managerId: userIds.abdelhamid,
    })
    expect(departments.find((department) => department.id === departmentIds.engineering)?.headUserId).toBe(userIds.abdelrahmanMohamed)
    expect(departments.find((department) => department.id === departmentIds.development)?.headUserId).toBe(userIds.mahmoudAyman)
    expect(mockRoles.some((role) => role.id === roleIds.departmentHead)).toBe(true)
  })

  it('allows an active employee to control only their own public company profile', () => {
    const { setPublicProfileVisibility } = useDirectoryStore.getState()
    useDirectoryStore.setState((state) => ({
      ...state,
      users: state.users.map((user) => user.id === userIds.adam ? { ...user, publicProfileVisible: undefined } : user),
    }))

    expect(setPublicProfileVisibility(userIds.adam, userIds.sarah, true)).toBe(false)
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.adam)?.publicProfileVisible).toBeUndefined()

    expect(setPublicProfileVisibility(userIds.adam, userIds.adam, true)).toBe(true)
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.adam)?.publicProfileVisible).toBe(true)

    expect(setPublicProfileVisibility(userIds.adam, userIds.adam, false)).toBe(true)
    expect(useDirectoryStore.getState().users.find((user) => user.id === userIds.adam)?.publicProfileVisible).toBe(false)
  })

  it('preserves employee public-profile consent when an administrator edits their account', () => {
    const employee = { ...mockUsers[0]!, publicProfileVisible: true }
    useDirectoryStore.setState({ users: mockUsers.map((user) => user.id === employee.id ? employee : user) })

    useDirectoryStore.getState().upsertUser({ ...employee, jobTitle: 'Senior Software Engineer' })

    expect(useDirectoryStore.getState().users.find((user) => user.id === employee.id)).toMatchObject({
      jobTitle: 'Senior Software Engineer',
      publicProfileVisible: true,
    })
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

describe('persisted data from older builds', () => {
  it('restores the current name and avatar of seeded users', () => {
    const migrate = useDirectoryStore.persist.getOptions().migrate!
    const stale = {
      users: mockUsers.map((user) => user.id === userIds.james
        ? { ...user, fullName: 'عبدالحميد', firstName: 'عبدالحميد', avatarUrl: '/avatars/abdelhamid-ibrahim.svg' }
        : user),
    }
    const migrated = migrate(stale, 8) as { users: typeof mockUsers }
    const ceo = migrated.users.find((user) => user.id === userIds.james)!
    const seeded = mockUsers.find((user) => user.id === userIds.james)!
    expect(ceo.fullName).toBe(seeded.fullName)
    expect(ceo.avatarUrl).toBe(seeded.avatarUrl)
    expect(ceo.avatarUrl).toBe('/avatars/abdelhamid-elsayed.svg')
  })

  it('adds the seeded Arabic and English profile versions without overwriting saved edits', () => {
    const migrate = useDirectoryStore.persist.getOptions().migrate!
    const seeded = mockUsers.find((user) => user.id === userIds.ahmedAyman)!
    const stale = {
      users: mockUsers.map((user) => user.id === userIds.ahmedAyman
        ? { ...user, profile: { ...seeded.profile!, localized: { en: { bio: 'My own English bio' } } } }
        : user),
    }
    const migrated = migrate(stale, 9) as { users: typeof mockUsers }
    const profile = migrated.users.find((user) => user.id === userIds.ahmedAyman)!.profile!
    expect(profile.localized?.en?.bio).toBe('My own English bio')
    expect(profile.localized?.en?.experiences?.length).toBeGreaterThan(0)
    expect(profile.localized?.ar?.education?.length).toBeGreaterThan(0)
  })
})
