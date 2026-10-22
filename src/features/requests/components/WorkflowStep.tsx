import { MessageSquareText } from 'lucide-react'
import { WorkflowStepStatus as StepStatus } from '@/types/workflow'
import type { WorkflowStepInstance } from '@/types/workflow'
import { useDirectoryStore } from '@/store/directoryStore'
import { ApproverInfo } from './ApproverInfo'
import { WorkflowStepStatus } from './WorkflowStepStatus'
import { formatDateTime } from './dateTime'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowStepProps {
  step: WorkflowStepInstance
  isLast: boolean
}

export function WorkflowStep({ step, isLast }: WorkflowStepProps) {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const actedBy = step.actedByUserId
    ? users.find((user) => user.id === step.actedByUserId)?.fullName
    : undefined

  return (
    <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-7 last:pb-0">
      {!isLast ? (
        <span
          className="absolute bottom-0 start-4 top-8 w-px bg-slate-200"
          aria-hidden="true"
        />
      ) : null}
      <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-white">
        <WorkflowStepStatus status={step.status} compact />
      </span>
      <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{t('requests.step')} {step.order}</p>
            <h3 className="mt-0.5 font-semibold text-slate-900">{content(step.name)}</h3>
          </div>
          <WorkflowStepStatus status={step.status} />
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <ApproverInfo target={step.approver} assignedUserId={step.assignedUserId} />
          {step.actedAt ? (
            <p className="shrink-0 text-xs text-slate-500">
              {step.status === StepStatus.APPROVED
                ? t('requests.approved')
                : step.status === StepStatus.REJECTED
                  ? t('requests.rejected')
                  : t('requests.actioned')}
              {actedBy ? ` ${t('requests.by')} ${content(actedBy)}` : ''} · {formatDateTime(step.actedAt, locale)}
            </p>
          ) : null}
        </div>
        {step.comment ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{step.comment}</span>
          </p>
        ) : null}
      </div>
    </li>
  )
}
