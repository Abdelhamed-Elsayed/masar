import { ArrowDown, CircleCheck, CircleUserRound } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import type { WorkflowDefinition } from '@/types/workflow'
import { approverLabel } from './workflowLabels'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowPreviewProps {
  definition: WorkflowDefinition
}

export function WorkflowPreview({ definition }: WorkflowPreviewProps) {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)

  return (
    <Card as="section" aria-labelledby="workflow-preview-heading" className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="workflow-preview-heading" className="text-lg font-semibold text-slate-900">{t('admin.workflowPreview')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('admin.approvalPathDescription')}</p>
        </div>
        <Badge variant="primary">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(definition.steps.length)} {definition.steps.length === 1 ? t('admin.step') : t('admin.steps')}</Badge>
      </div>
      {definition.description.trim() ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{definition.description}</p>
      ) : null}
      <ol className="mt-5 space-y-0">
        <li className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <CircleCheck size={19} className="shrink-0 text-emerald-700" aria-hidden="true" />
          <span className="font-medium text-slate-900">{t('admin.requestSubmitted')}</span>
        </li>
        {definition.steps.map((step) => (
          <li key={step.id} className="flex flex-col items-center">
            <ArrowDown size={17} className="my-2 text-slate-400" aria-hidden="true" />
            <div className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-800">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(step.order)}</span>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{content(step.name || t('admin.unnamedStep'))}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <CircleUserRound size={15} aria-hidden="true" />{approverLabel(step.approver, { users, departments, roles }, t, content)}
                </p>
              </div>
            </div>
          </li>
        ))}
        <li className="flex flex-col items-center">
          <ArrowDown size={17} className="my-2 text-slate-400" aria-hidden="true" />
          <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-center font-medium text-slate-800">{t('admin.requestCompleted')}</div>
        </li>
      </ol>
    </Card>
  )
}
