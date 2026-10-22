import { Card } from '@/components/ui'
import type { Department } from '@/types/department'
import type { User } from '@/types/user'
import type { FormDefinition } from '@/types/form'
import type { RequestFieldValue } from '@/types/common'
import type { SelectedAttachment } from './AttachmentsUploader'
import { useTranslation } from '@/localization/useTranslation'

interface RequestPreviewProps {
  requester: User
  department: Department | undefined
  form: FormDefinition | undefined
  values: Record<string, RequestFieldValue>
  files: SelectedAttachment[]
}

export function RequestPreview({ requester, department, form, values, files }: RequestPreviewProps) {
  const { t, content } = useTranslation()
  return <Card className="divide-y divide-slate-200">
    <div className="p-4 sm:p-5"><h2 className="font-semibold text-slate-900">{content(form?.name ?? t('dashboard.request'))}</h2><p className="mt-1 text-sm text-slate-500">{t('requests.previewDescription')}</p></div>
    <dl className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
      <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('requests.employee')}</dt><dd className="mt-1 text-sm text-slate-900">{content(requester.fullName)}</dd></div>
      <div><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('requests.department')}</dt><dd className="mt-1 text-sm text-slate-900">{content(department?.name ?? t('requests.notAssigned'))}</dd></div>
      {form?.fields.map((field) => <div key={field.id} className={field.kind === 'Textarea' ? 'sm:col-span-2' : ''}><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{content(field.label)}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{field.kind === 'File' ? files.length > 0 ? files.map(({ file }) => file.name).join(', ') : '—' : values[field.id] === null || values[field.id] === undefined || values[field.id] === '' ? '—' : content(String(values[field.id]))}</dd></div>)}
      <div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('requests.attachments')}</dt><dd className="mt-1 text-sm text-slate-900">{files.length > 0 ? files.map(({ file }) => file.name).join(', ') : t('requests.noAttachmentsShort')}</dd></div>
    </dl>
  </Card>
}
