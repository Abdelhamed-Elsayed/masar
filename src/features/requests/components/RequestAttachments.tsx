import { useEffect, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Card } from '@/components/ui'
import type { RequestAttachment as RequestAttachmentType } from '@/types/request'
import { getAttachmentFile } from '@/utils/attachmentStorage'
import { useTranslation } from '@/localization/useTranslation'

interface RequestAttachmentsProps { requestId: string; attachments: RequestAttachmentType[] }

export function RequestAttachments({ attachments }: RequestAttachmentsProps) {
  const { t, locale } = useTranslation()
  const [urls, setUrls] = useState<Record<string, string>>({})
  useEffect(() => {
    let active = true
    const created: string[] = []
    void Promise.all(attachments.map(async (attachment) => {
      const file = await getAttachmentFile(attachment.id).catch(() => undefined)
      if (!file) return null
      const url = URL.createObjectURL(file)
      created.push(url)
      return [attachment.id, url] as const
    })).then((entries) => {
      if (!active) return
      setUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))))
    })
    return () => {
      active = false
      created.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [attachments])

  return <Card as="section" aria-labelledby="request-attachments-heading" className="p-5">
    <div className="flex items-center justify-between gap-3"><h2 id="request-attachments-heading" className="text-base font-semibold text-slate-900">{t('requests.attachments')}</h2><span className="text-sm text-slate-500">{attachments.length}</span></div>
    {attachments.length === 0 ? <p className="mt-4 text-sm text-slate-500">{t('requests.noAttachments')}</p> : <ul className="mt-4 divide-y divide-slate-100">{attachments.map((attachment) => <li key={attachment.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><Paperclip size={17} className="shrink-0 text-slate-400" aria-hidden="true" />{urls[attachment.id] ? <a href={urls[attachment.id]} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm font-medium text-blue-700 hover:underline" download={attachment.fileName}>{attachment.fileName}</a> : <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{attachment.fileName}</span>}<span className="shrink-0 text-end text-xs text-slate-500"><span className="block">{formatFileSize(attachment.fileSize, locale)}</span><time dateTime={attachment.uploadedAt} className="mt-0.5 block">{new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(attachment.uploadedAt))}</time></span></li>)}</ul>}
  </Card>
}

function formatFileSize(size: number, locale: 'en' | 'ar'): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { maximumFractionDigits: 1 })
  if (size < 1024) return `${formatter.format(size)} B`
  if (size < 1024 * 1024) return `${formatter.format(size / 1024)} KB`
  return `${formatter.format(size / (1024 * 1024))} MB`
}
