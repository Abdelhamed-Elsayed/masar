import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
import type { WorkflowStepDefinition } from '@/types/workflow'
import { WorkflowConnector } from './WorkflowConnector'
import { WorkflowNode } from './WorkflowNode'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowCanvasProps {
  steps: WorkflowStepDefinition[]
  selectedStepId: string | null
  onSelectStep: (stepId: string) => void
  onMoveStep: (stepId: string, direction: -1 | 1) => void
  onRemoveStep: (stepId: string) => void
  onAddStep: () => void
}

export function WorkflowCanvas({
  steps, selectedStepId, onSelectStep, onMoveStep, onRemoveStep, onAddStep,
}: WorkflowCanvasProps) {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="workflow-canvas-heading" className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
      <div className="mb-5">
        <h2 id="workflow-canvas-heading" className="text-lg font-semibold text-slate-900">{t('admin.workflowCanvas')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.arrangeSteps')}</p>
      </div>
      <ol className="flex list-none flex-col items-center p-0" aria-label={t('admin.workflowSteps')}>
        <li className="w-full sm:flex sm:justify-center">
          <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center sm:w-[min(100%,34rem)]">
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-800">{t('admin.start')}</span>
            <span className="mt-1 block font-medium text-slate-900">{t('admin.requestSubmitted')}</span>
          </div>
        </li>
        {steps.map((step, index) => (
          <li key={step.id} className="w-full sm:flex sm:flex-col sm:items-center">
            <WorkflowConnector />
            <WorkflowNode
              step={step}
              selected={selectedStepId === step.id}
              onSelect={() => onSelectStep(step.id)}
              onMove={(direction) => onMoveStep(step.id, direction)}
              onRemove={() => onRemoveStep(step.id)}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
            />
          </li>
        ))}
        <li className="w-full sm:flex sm:flex-col sm:items-center">
          <WorkflowConnector />
          <Button type="button" variant="outline" className="w-full border-dashed sm:w-[min(100%,34rem)]" onClick={onAddStep}>
            <Plus size={17} />{t('admin.addApprovalStep')}
          </Button>
        </li>
        <li className="mt-4 w-full sm:flex sm:justify-center">
          <div className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-center sm:w-[min(100%,34rem)]">
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t('admin.end')}</span>
            <span className="mt-1 block font-medium text-slate-900">{t('admin.requestCompleted')}</span>
          </div>
        </li>
      </ol>
    </section>
  )
}
