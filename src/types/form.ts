export type FormFieldKind =
  | 'Text'
  | 'Number'
  | 'Date'
  | 'Select'
  | 'Textarea'
  | 'File'
  | 'Checkbox'

export interface FormFieldDefinition {
  id: string
  label: string
  kind: FormFieldKind
  required: boolean
  options: string[]
}

export interface FormDefinition {
  id: string
  name: string
  description: string
  fields: FormFieldDefinition[]
}
