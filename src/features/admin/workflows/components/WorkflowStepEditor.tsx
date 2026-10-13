import { Button, Card, Input } from '@/components/ui'
import type { WorkflowStepDefinition } from '@/types/workflow'
import { ApproverSelector } from './ApproverSelector'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowStepEditorProps {
  step: WorkflowStepDefinition
  onChange: (step: WorkflowStepDefinition) => void
  onClose: () => void
}

export function WorkflowStepEditor({ step, onChange, onClose }: WorkflowStepEditorProps) {
  const { t, locale } = useTranslation()
  return (
    <Card as="section" aria-labelledby="step-editor-heading" className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="step-editor-heading" className="text-lg font-semibold text-slate-900">{t('admin.editApprovalStep')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('admin.step')} {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(step.order)} {t('admin.stepInWorkflow')}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>{t('admin.done')}</Button>
      </div>
      <div>
        <label htmlFor="workflow-step-name" className="mb-1 block text-sm font-medium text-slate-700">{t('admin.stepName')}</label>
        <Input
          id="workflow-step-name"
          value={step.name}
          required
          maxLength={80}
          onChange={(event) => onChange({ ...step, name: event.currentTarget.value })}
        />
      </div>
      <ApproverSelector
        id={`approver-${step.id}`}
        value={step.approver}
        onChange={(approver) => onChange({ ...step, approver })}
      />
    </Card>
  )
}
