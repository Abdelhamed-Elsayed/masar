import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockDepartments } from '@/mock/departments'
import { mockUsers, roleIds, userIds } from '@/mock/users'
import { useDirectoryStore } from '@/store/directoryStore'
import { AdminDepartmentsManager } from './AdminDepartmentsManager'

describe('CEO department management', () => {
  beforeEach(() => {
    useDirectoryStore.setState({
      users: mockUsers,
      departments: mockDepartments,
      companyOwnerId: userIds.james,
    })
  })

  it('creates a department, assigns its head, and adds the department-head role', async () => {
    const user = userEvent.setup()
    render(<AdminDepartmentsManager />)

    await user.click(screen.getByRole('button', { name: 'Add department' }))
    await user.type(screen.getByLabelText(/Name/), 'Customer Success')
    await user.type(screen.getByLabelText(/Code/), 'CS')
    fireEvent.change(screen.getByLabelText(/Department head/), {
      target: { value: userIds.adam },
    })
    await user.click(screen.getByRole('button', { name: 'Create department' }))

    await waitFor(() => {
      const department = useDirectoryStore.getState().departments.find((item) => item.code === 'CS')
      const assignedUser = useDirectoryStore.getState().users.find((item) => item.id === userIds.adam)
      expect(department?.headUserId).toBe(userIds.adam)
      expect(assignedUser?.departmentId).toBe(department?.id)
      expect(assignedUser?.roleIds).toContain(roleIds.departmentHead)
    })
  })
})
