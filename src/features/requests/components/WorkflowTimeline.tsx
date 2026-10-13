import { Card } from '@/components/ui'
import type { WorkflowInstance } from '@/types/workflow'
import { WorkflowStep } from './WorkflowStep'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowTimelineProps {
  workflow: WorkflowInstance | undefined
}

export function WorkflowTimeline({ workflow }: WorkflowTimelineProps) {
  const { t } = useTranslation()
  const orderedSteps = workflow
    ? [...workflow.steps].sort((left, right) => left.order - right.order)
    : []

  return (
    <Card as="section" aria-labelledby="workflow-timeline-heading" className="p-5">
      <h2 id="workflow-timeline-heading" className="text-base font-semibold text-slate-900">
        {t('requests.workflowTimeline')}
      </h2>
      {orderedSteps.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{t('requests.workflowUnavailable')}</p>
      ) : (
        <ol className="mt-5">
          {orderedSteps.map((step, index) => (
            <WorkflowStep
              key={step.id}
              step={step}
              isLast={index === orderedSteps.length - 1}
            />
          ))}
        </ol>
      )}
    </Card>
  )
}
