import { Check, Circle, Clock3, X } from 'lucide-react'
import { WorkflowStepStatus as StepStatus } from '@/types/workflow'
import type { WorkflowStepStatus as StepStatusValue } from '@/types/workflow'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowStepStatusProps {
  status: StepStatusValue
  compact?: boolean
}

export function WorkflowStepStatus({ status, compact = false }: WorkflowStepStatusProps) {
  const { t } = useTranslation()
  const statusLabels: Record<StepStatusValue, string> = {
    [StepStatus.PENDING]: t('workflow.pending'),
    [StepStatus.CURRENT]: t('workflow.current'),
    [StepStatus.APPROVED]: t('requests.approved'),
    [StepStatus.REJECTED]: t('requests.rejected'),
    [StepStatus.SKIPPED]: t('workflow.skipped'),
  }
  const icon = (() => {
    switch (status) {
      case StepStatus.APPROVED:
        return <Check size={15} aria-hidden="true" />
      case StepStatus.REJECTED:
        return <X size={15} aria-hidden="true" />
      case StepStatus.CURRENT:
        return <Clock3 size={15} aria-hidden="true" />
      case StepStatus.PENDING:
      case StepStatus.SKIPPED:
        return <Circle size={15} aria-hidden="true" />
    }
  })()
  const tone = status === StepStatus.APPROVED
    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
    : status === StepStatus.REJECTED
      ? 'border-red-600 bg-red-50 text-red-700'
      : status === StepStatus.CURRENT
        ? 'border-blue-600 bg-blue-50 text-blue-700'
        : 'border-slate-300 bg-white text-slate-500'

  return (
    <span
      className={compact ? 'inline-flex' : 'inline-flex items-center gap-1.5 text-xs font-medium'}
      aria-label={statusLabels[status]}
      title={statusLabels[status]}
    >
      <span className={`flex size-6 items-center justify-center rounded-full border ${tone}`}>
        {icon}
      </span>
      {!compact ? <span>{statusLabels[status]}</span> : null}
    </span>
  )
}
