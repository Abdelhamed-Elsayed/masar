import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import { PageContainer, PageHeader } from '@/components/layout'
import { ContentCard } from '@/components/layout/primitives'
import { useFormStore } from '@/store/formStore'
import type {
  FormDefinition as BuilderForm,
  FormFieldDefinition as BuilderField,
  FormFieldKind as FieldKind,
} from '@/types/form'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

const fieldKinds: FieldKind[] = ['Text', 'Number', 'Date', 'Select', 'Textarea', 'File', 'Checkbox']
const fieldKindLabels: Record<FieldKind, TranslationKey> = {
  Text: 'admin.kindText',
  Number: 'admin.kindNumber',
  Date: 'admin.kindDate',
  Select: 'admin.kindSelect',
  Textarea: 'admin.kindTextarea',
  File: 'admin.kindFile',
  Checkbox: 'admin.kindCheckbox',
}

function isFieldKind(value: string): value is FieldKind {
  return fieldKinds.some((kind) => kind === value)
}

function makeField(): BuilderField {
  return { id: crypto.randomUUID(), label: 'New field', kind: 'Text', required: false, options: [] }
}

function PreviewField({ field, value, onChange }: {
  field: BuilderField
  value: string | boolean
  onChange: (value: string | boolean) => void
}) {
  const { t, content } = useTranslation()
  const controlId = `preview-${field.id}`
  if (field.kind === 'Checkbox') {
    return <label htmlFor={controlId} className="flex items-center gap-2 text-sm text-slate-700"><Checkbox id={controlId} checked={value === true} required={field.required} onChange={(event) => onChange(event.currentTarget.checked)} />{content(field.label)}{field.required ? <span className="text-red-700" aria-hidden="true">*</span> : null}</label>
  }
  let control: ReactNode
  if (field.kind === 'Select') {
    control = <Select id={controlId} value={typeof value === 'string' ? value : ''} required={field.required} onChange={(event) => onChange(event.currentTarget.value)}><option value="">{t('admin.chooseOption')}</option>{field.options.map((option) => <option key={option} value={option}>{content(option)}</option>)}</Select>
  } else if (field.kind === 'Textarea') {
    control = <Textarea id={controlId} value={typeof value === 'string' ? value : ''} required={field.required} onChange={(event) => onChange(event.currentTarget.value)} />
  } else if (field.kind === 'File') {
    control = <Input id={controlId} type="file" required={field.required} onChange={(event) => onChange(event.currentTarget.files?.[0]?.name ?? '')} />
  } else {
    const inputType = field.kind === 'Number' ? 'number' : field.kind === 'Date' ? 'date' : 'text'
    control = <Input id={controlId} type={inputType} value={typeof value === 'string' ? value : ''} required={field.required} onChange={(event) => onChange(event.currentTarget.value)} />
  }
  return <FormField><FormLabel htmlFor={controlId} required={field.required}>{content(field.label)}</FormLabel>{control}</FormField>
}

export function AdminFormsManager() {
  const { t, content, locale } = useTranslation()
  const forms = useFormStore((state) => state.forms)
  const upsertForm = useFormStore((state) => state.upsertForm)
  const [selectedFormId, setSelectedFormId] = useState<string>(() => forms[0]?.id ?? '')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [previewValues, setPreviewValues] = useState<Record<string, string | boolean>>({})
  const activeForm = forms.find((form) => form.id === selectedFormId)

  function updateActiveForm(transform: (form: BuilderForm) => BuilderForm) {
    const currentForm = forms.find((form) => form.id === selectedFormId)
    if (currentForm) upsertForm(transform(currentForm))
  }

  function createForm() {
    const form: BuilderForm = { id: crypto.randomUUID(), name: 'New form', description: '', fields: [] }
    upsertForm(form)
    setSelectedFormId(form.id)
    setMode('edit')
  }

  function updateField(fieldId: string, patch: Partial<BuilderField>) {
    updateActiveForm((form) => ({ ...form, fields: form.fields.map((field) => field.id === fieldId ? { ...field, ...patch } : field) }))
  }

  function updateFieldKind(field: BuilderField, kind: FieldKind) {
    updateField(field.id, { kind, options: kind === 'Select' ? (field.options.length > 0 ? field.options : ['Option 1']) : [] })
  }

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPreviewValues({})
    setMode('edit')
  }

  return (
    <PageContainer>
      <PageHeader title={t('navigation.forms')} description={t('admin.formsDescription')} actions={<Button type="button" onClick={createForm}>{t('admin.createForm')}</Button>} />
      <div className="grid min-w-0 gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside aria-label={t('admin.formLibrary')} className="min-w-0 space-y-2">
          <h2 className="px-1 text-sm font-semibold text-slate-700">{t('admin.formLibrary')}</h2>
          <ul className="flex max-h-56 gap-1 overflow-x-auto pb-1 lg:max-h-none lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">{forms.map((form) => <li key={form.id} className="min-w-36 lg:min-w-0"><button type="button" aria-current={form.id === selectedFormId ? 'page' : undefined} onClick={() => { setSelectedFormId(form.id); setMode('edit') }} className={`w-full rounded-lg px-3 py-2 text-start text-sm ${form.id === selectedFormId ? 'bg-blue-100 font-semibold text-blue-900' : 'text-slate-700 hover:bg-slate-100'}`}>{content(form.name)}</button></li>)}</ul>
        </aside>
        {activeForm ? <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(activeForm.fields.length)} {activeForm.fields.length === 1 ? t('admin.field') : t('admin.fields')}</p>
            <div className="flex flex-wrap gap-2"><Button type="button" variant={mode === 'edit' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>{t('admin.editForm')}</Button><Button type="button" variant={mode === 'preview' ? 'primary' : 'outline'} size="sm" aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>{t('admin.preview')}</Button></div>
          </div>
          {mode === 'edit' ? <ContentCard title={t('admin.formEditor')} description={t('admin.formEditorDescription')}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField><FormLabel htmlFor="builder-form-name" required>{t('admin.formName')}</FormLabel><Input id="builder-form-name" value={activeForm.name} onChange={(event) => { const name = event.currentTarget.value; updateActiveForm((form) => ({ ...form, name })) }} required /></FormField>
                <FormField><FormLabel htmlFor="builder-form-description">{t('admin.description')}</FormLabel><Input id="builder-form-description" value={activeForm.description} onChange={(event) => { const description = event.currentTarget.value; updateActiveForm((form) => ({ ...form, description })) }} /></FormField>
              </div>
              <div className="space-y-3">
                {activeForm.fields.map((field, index) => <fieldset key={field.id} className="grid min-w-0 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_10rem_minmax(0,1fr)_auto]">
                  <legend className="sr-only">{t('admin.field')} {index + 1}</legend>
                  <FormField><FormLabel htmlFor={`field-label-${field.id}`}>{t('admin.fieldLabel')}</FormLabel><Input id={`field-label-${field.id}`} value={field.label} onChange={(event) => updateField(field.id, { label: event.currentTarget.value })} /></FormField>
                  <FormField><FormLabel htmlFor={`field-kind-${field.id}`}>{t('admin.type')}</FormLabel><Select id={`field-kind-${field.id}`} value={field.kind} onChange={(event) => { const kind = event.currentTarget.value; if (isFieldKind(kind)) updateFieldKind(field, kind) }}>{fieldKinds.map((kind) => <option key={kind} value={kind}>{t(fieldKindLabels[kind])}</option>)}</Select></FormField>
                  <div className="flex min-w-0 flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700"><Checkbox checked={field.required} onChange={(event) => updateField(field.id, { required: event.currentTarget.checked })} />{t('admin.required')}</label>
                    {field.kind === 'Select' ? <FormField className="min-w-0 flex-1"><FormLabel htmlFor={`field-options-${field.id}`}>{t('admin.optionsComma')}</FormLabel><Input id={`field-options-${field.id}`} value={field.options.join(', ')} onChange={(event) => updateField(field.id, { options: event.currentTarget.value.split(',').map((option) => option.trim()).filter(Boolean) })} /></FormField> : null}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="self-center text-red-700" aria-label={`${t('admin.remove')} ${content(field.label)}`} onClick={() => updateActiveForm((form) => ({ ...form, fields: form.fields.filter((item) => item.id !== field.id) }))}>{t('admin.remove')}</Button>
                </fieldset>)}
                {activeForm.fields.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">{t('admin.noFields')}</p> : null}
              </div>
              <Button type="button" variant="outline" onClick={() => updateActiveForm((form) => ({ ...form, fields: [...form.fields, makeField()] }))}>{t('admin.addField')}</Button>
            </div>
          </ContentCard> : <ContentCard title={content(activeForm.name || t('admin.untitledForm'))} description={content(activeForm.description || t('admin.employeePreviewDescription'))}>
            <form className="space-y-5" onSubmit={submitPreview}>
              {activeForm.fields.map((field) => <PreviewField key={field.id} field={field} value={previewValues[field.id] ?? (field.kind === 'Checkbox' ? false : '')} onChange={(value) => setPreviewValues((current) => ({ ...current, [field.id]: value }))} />)}
              {activeForm.fields.length === 0 ? <p className="text-sm text-slate-500">{t('admin.addFieldsHint')}</p> : <Button type="submit">{t('admin.submitPreview')}</Button>}
            </form>
          </ContentCard>}
        </div> : <ContentCard title={t('admin.noForms')}><p className="text-sm text-slate-600">{t('admin.createFormHint')}</p></ContentCard>}
      </div>
    </PageContainer>
  )
}
