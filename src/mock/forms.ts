import type { FormDefinition } from '@/types/form'

export const mockForms: FormDefinition[] = [
  {
    id: 'form-leave',
    name: 'Leave request form',
    description: 'Provide dates and details for your time away.',
    fields: [
      { id: 'leave-type', label: 'Leave type', kind: 'Select', required: true, options: ['Annual', 'Sick', 'Unpaid'] },
      { id: 'start-date', label: 'Start date', kind: 'Date', required: true, options: [] },
      { id: 'end-date', label: 'End date', kind: 'Date', required: true, options: [] },
      { id: 'reason', label: 'Reason', kind: 'Textarea', required: false, options: [] },
    ],
  },
  {
    id: 'form-equipment',
    name: 'Equipment request form',
    description: 'Describe the equipment and why it is needed.',
    fields: [
      { id: 'item', label: 'Item requested', kind: 'Text', required: true, options: [] },
      { id: 'quantity', label: 'Quantity', kind: 'Number', required: true, options: [] },
      { id: 'justification', label: 'Business justification', kind: 'Textarea', required: true, options: [] },
      { id: 'quote', label: 'Attach a quote', kind: 'File', required: false, options: [] },
    ],
  },
]
