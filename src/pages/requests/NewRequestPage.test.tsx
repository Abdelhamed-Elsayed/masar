import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userIds, mockUsers } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useFormStore } from '@/store/formStore'
import { useRequestStore } from '@/store/requestStore'
import type { FormDefinition } from '@/types/form'
import { NewRequestPage } from './NewRequestPage'

const checkboxForm: FormDefinition = {
  id: 'form-required-consent-test',
  name: 'Required consent form',
  description: '',
  fields: [{ id: 'consent', label: 'Confirm details', kind: 'Checkbox', required: true, options: [] }],
}

const requiredFileForm: FormDefinition = {
  id: 'form-required-file-test',
  name: 'Required file form',
  description: '',
  fields: [{ id: 'supporting-file', label: 'Supporting document', kind: 'File', required: true, options: [] }],
}

describe('NewRequestPage validation', () => {
  beforeEach(() => {
    const requestType = {
      id: 'request-type-validation-test',
      name: 'Validation request',
      code: 'VALIDATION',
      description: '',
      workflowDefinitionId: 'workflow-test',
      formDefinitionId: checkboxForm.id,
    }
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.adam)! })
    useDirectoryStore.setState((state) => ({ ...state, requestTypes: [requestType] }))
    useFormStore.setState({ forms: [checkboxForm] })
    useRequestStore.setState({
      createDraft: vi.fn(),
      updateDraft: vi.fn(),
      submitRequest: vi.fn(),
    })
  })

  it('blocks moving forward when a required checkbox is unchecked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NewRequestPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Request details' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please complete the required field: Confirm details.')
    expect(screen.getByRole('heading', { name: 'Request details' })).toBeInTheDocument()
    expect(useRequestStore.getState().createDraft).not.toHaveBeenCalled()
  })

  it('allows continuing when a required checkbox is checked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NewRequestPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('checkbox', { name: 'Confirm details *' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByRole('heading', { name: 'Attachments' })).toBeInTheDocument()
  })

  it('requires an attachment for a required file field and then allows continuing', async () => {
    const user = userEvent.setup()
    useDirectoryStore.setState((state) => ({
      ...state,
      requestTypes: [{
        id: 'request-type-validation-test',
        name: 'Validation request',
        code: 'VALIDATION',
        description: '',
        workflowDefinitionId: 'workflow-test',
        formDefinitionId: requiredFileForm.id,
      }],
    }))
    useFormStore.setState({ forms: [requiredFileForm] })
    render(
      <MemoryRouter>
        <NewRequestPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Supporting document', { selector: 'label' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Attachments' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Please complete the required field: Supporting document.')
    const attachmentInput = screen.getByLabelText(/Attachments/) as HTMLInputElement
    await user.upload(attachmentInput, new File(['support'], 'support.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('heading', { name: 'Review and submit' })).toBeInTheDocument()
  })

  it('reports draft persistence failures instead of leaving the user without feedback', async () => {
    const user = userEvent.setup()
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(useRequestStore.getState().createDraft).mockRejectedValueOnce(new Error('Storage unavailable'))
    render(
      <MemoryRouter>
        <NewRequestPage />
      </MemoryRouter>,
    )

    try {
      await user.click(screen.getByRole('button', { name: 'Save as draft' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Your request could not be saved. Please try again.')
    } finally {
      logError.mockRestore()
    }
  })
})
