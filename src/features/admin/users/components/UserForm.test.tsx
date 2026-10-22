import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { mockDepartments } from '@/mock/departments'
import { mockRoles } from '@/mock/users'
import { UserForm } from './UserForm'
import type { UserDraft } from './UserForm'

const draft: UserDraft = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  departmentId: '',
  managerId: null,
  roleIds: [],
  isActive: true,
  password: '',
}

function renderUserForm(isEditing = false) {
  function UserFormHarness() {
    const [currentDraft, setCurrentDraft] = useState(draft)
    return (
      <UserForm
        draft={currentDraft}
        departments={mockDepartments}
        roles={mockRoles}
        users={[]}
        error=""
        isEditing={isEditing}
        onDraftChange={(updates) => setCurrentDraft((current) => ({ ...current, ...updates }))}
        onToggleRole={vi.fn()}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
  }

  return render(
    <UserFormHarness />,
  )
}

describe('UserForm validation', () => {
  it('requires the core fields and password when creating a user', () => {
    const { container } = renderUserForm()
    const form = container.querySelector('form')!

    expect(form.checkValidity()).toBe(false)
    expect(screen.getByLabelText(/First name/)).toBeRequired()
    expect(screen.getByLabelText(/Last name/)).toBeRequired()
    expect(screen.getByLabelText(/^Email/)).toBeRequired()
    expect(screen.getByLabelText(/Employee ID/)).toBeRequired()
    expect(screen.getByLabelText(/^Password/)).toBeRequired()
    expect(screen.getByRole('combobox', { name: /Department/ })).toBeRequired()
  })

  it('validates email syntax and the minimum password length', async () => {
    const user = userEvent.setup()
    renderUserForm()
    const email = screen.getByLabelText(/^Email/) as HTMLInputElement
    const password = screen.getByLabelText(/^Password/) as HTMLInputElement

    await user.type(email, 'invalid-email')
    await user.type(password, 'short')

    expect(email.validity.typeMismatch).toBe(true)
    expect(password.minLength).toBe(8)
    expect(password.value.length).toBeLessThan(password.minLength)
  })

  it('allows an empty password when editing an existing user', () => {
    renderUserForm(true)

    expect(screen.getByLabelText(/^Password/)).not.toBeRequired()
  })
})
