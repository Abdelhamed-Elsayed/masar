import { useId } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { useTranslation } from '@/localization/useTranslation'

export interface SelectedAttachment {
  id: string
  file: File
}

interface AttachmentsUploaderProps {
  files: SelectedAttachment[]
  required?: boolean
  onAdd: (files: FileList | null) => void
  onRemove: (id: string) => void
}

export function AttachmentsUploader({ files, required = false, onAdd, onRemove }: AttachmentsUploaderProps) {
  const inputId = useId()
  const { t, locale } = useTranslation()

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {t('requests.attachments')} <span className="font-normal text-slate-500">({required ? t('attachments.required') : t('attachments.optional')})</span>
        </label>
        <Input
          id={inputId}
          type="file"
          multiple
          onChange={(event) => {
            onAdd(event.currentTarget.files)
            event.currentTarget.value = ''
          }}
          className="file:me-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
          aria-describedby={`${inputId}-hint`}
        />
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {t('attachments.hint')}
        </p>
      </div>
      {files.length > 0 ? (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {files.map(({ id, file }) => (
            <li key={id} className="flex items-center justify-between gap-3 p-3">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
                <Paperclip size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-500">{formatFileSize(file.size, locale)}</span>
              </span>
              <Button type="button" variant="ghost" size="sm" aria-label={`${t('attachments.remove')} ${file.name}`} onClick={() => onRemove(id)}>
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function formatFileSize(size: number, locale: 'en' | 'ar'): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 1 })
  if (size < 1024) return `${formatter.format(size)} B`
  if (size < 1024 * 1024) return `${formatter.format(size / 1024)} KB`
  return `${formatter.format(size / (1024 * 1024))} MB`
}
