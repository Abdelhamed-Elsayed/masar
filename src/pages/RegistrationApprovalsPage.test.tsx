import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockDepartments } from '@/mock/departments'
import { mockUsers, roleIds, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import type { User } from '@/types/user'
import { RegistrationApprovalsPage } from './RegistrationApprovalsPage'

const hrDepartmentApplicant: User = {
  id: 'user-hr-head-review-test',
  employeeId: 'PENDING-HR-TEST',
  firstName: 'Jordan',
  lastName: 'Taylor',
  fullName: 'Jordan Taylor',
  email: 'jordan.hrhead@example.com',
  jobTitle: 'Coordinator',
  departmentId: 'dept-hr',
  managerId: null,
  roleIds: [roleIds.employee],
  isActive: false,
  avatarUrl: null,
  approvalStatus: 'PENDING',
  registrationStage: 'DEPARTMENT_HEAD_REVIEW',
}

describe('RegistrationApprovalsPage queues', () => {
  beforeEach(() => {
    useDirectoryStore.setState((state) => ({
      ...state,
      users: [...mockUsers, hrDepartmentApplicant],
      departments: mockDepartments,
      companyOwnerId: userIds.abdelhamid,
    }))
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.abdelrahmanGhoneim)!, isInitializing: false })
  })

  it('shows an HR director the department-head queue for her department as well as HR duties', () => {
    render(<RegistrationApprovalsPage />)

    expect(screen.getByRole('button', { name: /Jordan Taylor/ })).toBeInTheDocument()
    expect(screen.getByText('Department head review')).toBeInTheDocument()
  })
})
