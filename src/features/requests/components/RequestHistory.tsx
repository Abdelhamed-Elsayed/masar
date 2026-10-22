import { Card } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import { WorkflowStepStatus } from '@/types/workflow'
import type { Request } from '@/types/request'
import type { WorkflowInstance } from '@/types/workflow'
import { useTranslation } from '@/localization/useTranslation'

interface RequestHistoryProps {
  request: Request
  workflow: WorkflowInstance | undefined
}

interface HistoryEntry {
  id: string
  action: string
  actor: string
  date: string
  comment: string | null
}

export function RequestHistory({ request, workflow }: RequestHistoryProps) {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const requester = users.find((user) => user.id === request.requesterId)
  const entries: HistoryEntry[] = [
    {
      id: `${request.id}-created`,
      action: t('requests.draftCreated'),
      actor: requester ? content(requester.fullName) : t('requests.unknownActor'),
      date: request.createdAt,
      comment: null,
    },
    ...(request.submittedAt
      ? [{
          id: `${request.id}-submitted`,
          action: t('requests.submittedAction'),
          actor: requester ? content(requester.fullName) : t('requests.unknownActor'),
          date: request.submittedAt,
          comment: null,
        }]
      : []),
    ...(workflow?.steps.flatMap((step) => {
      if (
        step.status !== WorkflowStepStatus.APPROVED &&
        step.status !== WorkflowStepStatus.REJECTED
      ) {
        return []
      }
      const actor = step.actedByUserId
        ? users.find((user) => user.id === step.actedByUserId)
        : undefined
      return [{
        id: step.id,
        action: step.status === WorkflowStepStatus.APPROVED
          ? `${content(step.name)} ${t('requests.approvedAction')}`
          : `${content(step.name)} ${t('requests.rejectedAction')}`,
        actor: actor ? content(actor.fullName) : t('requests.unknownActor'),
        date: step.actedAt ?? request.updatedAt,
        comment: step.comment,
      }]
    }) ?? []),
  ].sort((left, right) => right.date.localeCompare(left.date))

  return (
    <Card as="section" aria-labelledby="request-history-heading" className="p-5">
      <h2 id="request-history-heading" className="text-base font-semibold text-slate-900">
        {t('requests.history')}
      </h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{t('requests.noHistory')}</p>
      ) : (
        <ol className="mt-5 space-y-0">
          {entries.map((entry, index) => (
            <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
              {index < entries.length - 1 ? (
                <span className="absolute bottom-0 start-[0.4375rem] top-3 w-px bg-slate-200" aria-hidden="true" />
              ) : null}
              <span className="relative z-10 mt-1 size-2.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-white" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                  <span className="flex flex-wrap gap-x-2 text-xs text-slate-500">
                    <time dateTime={entry.date}>
                      {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(entry.date))}
                    </time>
                    <time dateTime={entry.date}>
                      {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { timeStyle: 'short' }).format(new Date(entry.date))}
                    </time>
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{t('requests.by')} {entry.actor}</p>
                {entry.comment ? (
                  <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                    {entry.comment}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
