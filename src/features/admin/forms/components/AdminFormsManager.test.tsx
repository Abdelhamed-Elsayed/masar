import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFormStore } from '@/store/formStore'
import type { FormDefinition } from '@/types/form'
import { AdminFormsManager } from './AdminFormsManager'

const formWithRequiredField: FormDefinition = {
  id: 'form-required-field-test',
  name: 'Required field form',
  description: 'Test form',
  fields: [{ id: 'required-input', label: 'Required information', kind: 'Text', required: true, options: [] }],
}

describe('AdminFormsManager preview validation', () => {
  beforeEach(() => {
    useFormStore.setState({ forms: [formWithRequiredField] })
  })

  it('prevents preview submission while a required field is empty', async () => {
    const user = userEvent.setup()
    render(<AdminFormsManager />)

    await user.click(screen.getByRole('button', { name: 'Preview' }))
    const requiredField = screen.getByLabelText(/Required information/) as HTMLInputElement

    expect(requiredField).toBeRequired()
    expect(requiredField.validity.valueMissing).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Submit preview' }))

    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Submit preview' })).toBeInTheDocument()
  })

  it('allows preview submission after required information is provided', async () => {
    const user = userEvent.setup()
    render(<AdminFormsManager />)

    await user.click(screen.getByRole('button', { name: 'Preview' }))
    await user.type(screen.getByLabelText(/Required information/), 'Complete')
    await user.click(screen.getByRole('button', { name: 'Submit preview' }))

    expect(screen.getByRole('button', { name: 'Edit form' })).toHaveAttribute('aria-pressed', 'true')
  })
})
