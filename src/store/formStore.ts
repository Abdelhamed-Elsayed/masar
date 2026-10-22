import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockForms } from '@/mock/forms'
import type { FormDefinition } from '@/types/form'

interface FormState {
  forms: FormDefinition[]
  upsertForm: (form: FormDefinition) => void
  getFormById: (id: string) => FormDefinition | undefined
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      forms: mockForms,
      upsertForm: (form) => set((state) => ({
        forms: state.forms.some((item) => item.id === form.id)
          ? state.forms.map((item) => (item.id === form.id ? form : item))
          : [...state.forms, form],
      })),
      getFormById: (id) => get().forms.find((form) => form.id === id),
    }),
    { name: 'masar-forms' },
  ),
)
