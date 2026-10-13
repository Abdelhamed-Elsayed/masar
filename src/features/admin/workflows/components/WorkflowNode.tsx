import { Check, ChevronDown, ChevronUp, CircleUserRound, GripVertical, Trash2 } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import type { WorkflowStepDefinition } from '@/types/workflow'
import { approverLabel } from './workflowLabels'
import { useTranslation } from '@/localization/useTranslation'

interface WorkflowNodeProps {
  step: WorkflowStepDefinition
  selected: boolean
  onSelect: () => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  isFirst: boolean
  isLast: boolean
}

export function WorkflowNode({
  step, selected, onSelect, onMove, onRemove, isFirst, isLast,
}: WorkflowNodeProps) {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)

  return (
    <Card
      as="article"
      aria-current={selected ? 'step' : undefined}
      className={`w-full p-4 transition-shadow sm:w-[min(100%,34rem)] ${selected ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 text-slate-400" aria-hidden="true"><GripVertical size={18} /></span>
        <button
          type="button"
          onClick={onSelect}
          aria-label={`${t('admin.editApprovalStep')} ${new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(step.order)}: ${content(step.name)}`}
          className="min-w-0 flex-1 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-50">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(step.order)}</span>
            {t('admin.approvalStep')}
          </span>
          <span className="mt-2 block truncate text-base font-semibold text-slate-900">{content(step.name)}</span>
          <span className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <CircleUserRound size={16} aria-hidden="true" />{approverLabel(step.approver, { users, departments, roles }, t, content)}
          </span>
        </button>
        <div className="flex shrink-0 flex-col gap-1">
          <Button type="button" variant="ghost" size="sm" aria-label={`${t('admin.moveStepUp')}: ${content(step.name)}`} disabled={isFirst} onClick={() => onMove(-1)}>
            <ChevronUp size={16} />
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={`${t('admin.moveStepDown')}: ${content(step.name)}`} disabled={isLast} onClick={() => onMove(1)}>
            <ChevronDown size={16} />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <Button type="button" variant="ghost" size="sm" onClick={onSelect}>
          {selected ? <><Check size={15} />{t('admin.editing')}</> : t('admin.editStep')}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" aria-label={`${t('admin.removeStep')}: ${content(step.name)}`} onClick={onRemove}>
          <Trash2 size={15} />{t('admin.removeStep')}
        </Button>
      </div>
    </Card>
  )
}
