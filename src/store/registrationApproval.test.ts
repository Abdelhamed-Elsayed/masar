import { beforeEach, describe, expect, it } from 'vitest'
import { useDirectoryStore } from '@/store/directoryStore'
import { useAuthStore } from '@/store/authStore'
import { demoCredentials, mockUsers, roleIds, userIds } from '@/mock/users'
import { mockDepartments } from '@/mock/departments'
import type { User } from '@/types/user'

describe('registration rejection flow', () => {
  beforeEach(() => {
    useDirectoryStore.setState((state) => ({
      ...state,
      users: state.users.map((user) => user.id === userIds.adam ? { ...user, isActive: false, approvalStatus: 'REJECTED', registrationStage: 'REJECTED', registrationDecisionNote: 'Documents could not be verified.' } : user),
    }))
    useAuthStore.setState({ currentUser: null, roles: [], isInitializing: false })
  })

  it('keeps rejected registrations inactive', () => {
    const user = useDirectoryStore.getState().users.find((item) => item.id === userIds.adam)!
    expect(user.isActive).toBe(false)
    expect(user.approvalStatus).toBe('REJECTED')
    expect(user.registrationStage).toBe('REJECTED')
    expect(user.registrationDecisionNote).toContain('Documents')
  })

  it('blocks login for a rejected account and keeps the rejection reason available', async () => {
    const user = useDirectoryStore.getState().users.find((item) => item.id === userIds.adam)!
    const result = await useAuthStore.getState().login(user.email, 'Masar@1021')
    expect(result).toBe('REGISTRATION_REJECTED')
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  it('does not treat a rejected account as an active session', () => {
    const user = useDirectoryStore.getState().users.find((item) => item.id === userIds.adam)!
    expect(user.roleIds).toContain(roleIds.employee)
    expect(user.isActive).toBe(false)
  })

  it('uses unique four-bit binary passwords for default accounts', async () => {
    const passwords = Object.values(demoCredentials)
    expect(passwords).toEqual([
      'Masar@0000',
      'Masar@0001',
      'Masar@0010',
      'Masar@0011',
      'Masar@0100',
      'Masar@0101',
      'Masar@0110',
      'Masar@0111',
    ])
    expect(new Set(passwords).size).toBe(passwords.length)

    const user = useDirectoryStore.getState().users.find((item) => item.id === userIds.sarah)!
    expect(await useAuthStore.getState().login(user.email, demoCredentials[user.id])).toBeNull()
  })

  it('keeps a new account pending through HR and department review, then enables login after CEO approval', async () => {
    useDirectoryStore.setState((state) => ({ ...state, users: mockUsers, departments: mockDepartments, companyOwnerId: userIds.james }))
    const applicant: User = {
      id: 'user-registration-lifecycle-test',
      employeeId: 'PENDING-TEST',
      firstName: 'Taylor',
      lastName: 'Morgan',
      fullName: 'Taylor Morgan',
      email: 'taylor.lifecycle@example.com',
      jobTitle: 'Analyst',
      departmentId: 'dept-engineering',
      managerId: null,
      roleIds: [roleIds.employee],
      isActive: false,
      avatarUrl: null,
      approvalStatus: 'PENDING',
      registrationStage: 'HR_REVIEW',
    }

    expect(await useAuthStore.getState().registerPendingUser(applicant, 'StrongPass1')).toBe(true)
    expect(await useAuthStore.getState().login(applicant.email, 'StrongPass1')).toBe('PENDING_APPROVAL')
    expect(useDirectoryStore.getState().approveRegistrationByHr(applicant.id, userIds.maya)).toBe(true)
    expect(useDirectoryStore.getState().users.find((user) => user.id === applicant.id)?.registrationStage).toBe('DEPARTMENT_HEAD_REVIEW')
    expect(await useAuthStore.getState().login(applicant.email, 'StrongPass1')).toBe('PENDING_APPROVAL')
    expect(useDirectoryStore.getState().approveRegistrationByDepartmentHead(applicant.id, userIds.daniel)).toBe(true)
    expect(useDirectoryStore.getState().users.find((user) => user.id === applicant.id)?.registrationStage).toBe('CEO_REVIEW')
    expect(await useAuthStore.getState().login(applicant.email, 'StrongPass1')).toBe('PENDING_APPROVAL')

    expect(useDirectoryStore.getState().finalizeRegistrationByCeo(applicant.id, userIds.james, {
      jobTitle: 'Senior Analyst',
      departmentId: 'dept-engineering',
      managerId: userIds.sarah,
      roleIds: [roleIds.employee],
    })).toBe(true)

    const approvedApplicant = useDirectoryStore.getState().users.find((user) => user.id === applicant.id)!
    expect(approvedApplicant.isActive).toBe(true)
    expect(approvedApplicant.approvalStatus).toBe('APPROVED')
    expect(approvedApplicant.registrationStage).toBe('APPROVED')
    expect(await useAuthStore.getState().login(applicant.email, 'StrongPass1')).toBeNull()
  })
})
