import { DateInput, Input, Select, Textarea, Checkbox } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms'
import type { User } from '@/types/user'
import type { Department } from '@/types/department'
import type { FormDefinition, FormFieldDefinition } from '@/types/form'
import type { RequestFieldValue } from '@/types/common'
import { useTranslation } from '@/localization/useTranslation'

interface RequestFormProps {
  requester: User
  department: Department | undefined
  form: FormDefinition | undefined
  values: Record<string, RequestFieldValue>
  onChange: (values: Record<string, RequestFieldValue>) => void
}

function Field({ field, value, onChange }: { field: FormFieldDefinition; value: RequestFieldValue; onChange: (value: RequestFieldValue) => void }) {
  const { t, content } = useTranslation()
  const id = `request-field-${field.id}`
  if (field.kind === 'Checkbox') {
    return <label htmlFor={id} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3"><Checkbox id={id} checked={Boolean(value)} onChange={(event) => onChange(event.currentTarget.checked)} /><span className="text-sm text-slate-700">{content(field.label)}{field.required ? ' *' : ''}</span></label>
  }
  return <FormField className={field.kind === 'Textarea' ? 'sm:col-span-2' : undefined}>
    <FormLabel htmlFor={field.kind === 'File' ? undefined : id} required={field.required}>{content(field.label)}</FormLabel>
    {field.kind === 'Select' ? <Select id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.currentTarget.value)}><option value="">{t('requests.chooseOption')}</option>{field.options.map((option) => <option key={option} value={option}>{content(option)}</option>)}</Select>
      : field.kind === 'Textarea' ? <Textarea id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.currentTarget.value)} />
      : field.kind === 'Date' ? <DateInput id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.currentTarget.value)} />
      : field.kind === 'Number' ? <Input id={id} type="number" required={field.required} value={value === null ? '' : String(value)} onChange={(event) => onChange(event.currentTarget.value === '' ? null : Number(event.currentTarget.value))} />
      : field.kind === 'File' ? <p id={id} className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500">{t('requests.addFileInAttachments')}</p>
      : <Input id={id} required={field.required} value={String(value ?? '')} onChange={(event) => onChange(event.currentTarget.value)} />}
  </FormField>
}

export function RequestForm({ requester, department, form, values, onChange }: RequestFormProps) {
  const { t, content } = useTranslation()
  function update(id: string, value: RequestFieldValue) {
    onChange({ ...values, [id]: value })
  }
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField><FormLabel htmlFor="requester">{t('requests.employee')}</FormLabel><Input id="requester" value={requester.fullName} readOnly /></FormField>
      <FormField><FormLabel htmlFor="department">{t('requests.department')}</FormLabel><Input id="department" value={content(department?.name ?? t('requests.notAssigned'))} readOnly /></FormField>
    </div>
    {form ? <div className="grid gap-4 sm:grid-cols-2">{form.fields.map((field) => <Field key={field.id} field={field} value={values[field.id] ?? null} onChange={(value) => update(field.id, value)} />)}</div> : <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{t('requests.noFormAssigned')}</p>}
  </div>
}
