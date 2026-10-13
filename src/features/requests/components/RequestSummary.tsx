import { Card } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import type { Request } from '@/types/request'
import { formatDateTime } from './dateTime'
import { useTranslation } from '@/localization/useTranslation'

interface RequestSummaryProps {
  request: Request
}

function displayField(value: string | number | boolean | null, content: (value: string) => string, t: ReturnType<typeof useTranslation>['t']): string {
  if (value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')
  return content(String(value))
}

export function RequestSummary({ request }: RequestSummaryProps) {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const requestTypes = useDirectoryStore((state) => state.requestTypes)
  const requester = users.find((user) => user.id === request.requesterId)
  const department = departments.find((item) => item.id === request.departmentId)
  const requestType = requestTypes.find((item) => item.id === request.requestTypeId)

  return (
    <Card as="section" aria-labelledby="request-summary-heading" className="p-5">
      <h2 id="request-summary-heading" className="text-base font-semibold text-slate-900">
        {t('requests.summary')}
      </h2>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryItem label={t('requests.requester')} value={requester?.fullName ?? t('requests.unknownUser')} />
        <SummaryItem label={t('requests.department')} value={content(department?.name ?? t('requests.unknownDepartment'))} />
        <SummaryItem label={t('requests.requestType')} value={content(requestType?.name ?? t('requests.unknownDepartment'))} />
        <SummaryItem label={t('requests.created')} value={formatDateTime(request.createdAt, locale)} />
        {Object.entries(request.fields).map(([key, value]) => (
          <SummaryItem key={key} label={content(formatLabel(key))} value={displayField(value, content, t)} />
        ))}
      </dl>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">{value}</dd>
    </div>
  )
}

function formatLabel(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (character) => character.toUpperCase())
}
