import { beforeEach, describe, expect, it } from 'vitest'
import { useFormStore } from './formStore'
import type { FormDefinition } from '@/types/form'

function makeForm(overrides: Partial<FormDefinition>): FormDefinition {
  return {
    id: 'form-test',
    name: 'Test Form',
    description: 'A form used only in tests',
    fields: [],
    ...overrides,
  }
}

describe('useFormStore', () => {
  beforeEach(() => {
    useFormStore.setState({ forms: [] })
  })

  it('upsertForm adds a new form when its id is not already present', () => {
    const form = makeForm({ id: 'form-new' })
    useFormStore.getState().upsertForm(form)
    expect(useFormStore.getState().forms).toEqual([form])
  })

  it('upsertForm replaces the existing form in place when the id already exists', () => {
    const original = makeForm({ id: 'form-1', name: 'Original' })
    const updated = makeForm({ id: 'form-1', name: 'Updated' })
    useFormStore.setState({ forms: [original] })

    useFormStore.getState().upsertForm(updated)

    const { forms } = useFormStore.getState()
    expect(forms).toHaveLength(1)
    expect(forms[0].name).toBe('Updated')
  })

  it('upsertForm does not disturb other forms in the list', () => {
    const other = makeForm({ id: 'form-other', name: 'Other' })
    useFormStore.setState({ forms: [other] })

    useFormStore.getState().upsertForm(makeForm({ id: 'form-new' }))

    expect(useFormStore.getState().forms.map((form) => form.id)).toEqual(['form-other', 'form-new'])
  })
})
