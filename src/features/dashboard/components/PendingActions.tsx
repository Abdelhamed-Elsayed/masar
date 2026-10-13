import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router'
import { Badge, Card, EmptyState } from '@/components/ui'
import { inboxDetailsPath } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { WorkflowStepStatus } from '@/types/workflow'
import { useTranslation } from '@/localization/useTranslation'

export function PendingActions() {
  const { t, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const requests = useRequestStore((state) => state.requests)
  const instances = useWorkflowStore((state) => state.instances)
  const pendingItems = currentUser
    ? instances
        .flatMap((instance) =>
          instance.steps
            .filter(
              (step) =>
                step.assignedUserId === currentUser.id &&
                step.status === WorkflowStepStatus.CURRENT,
            )
            .map((step) => ({
              instance,
              step,
              request: requests.find((request) => request.id === instance.requestId),
            })),
        )
        .filter(
          (
            item,
          ): item is (typeof item) & {
            request: NonNullable<(typeof item)['request']>
          } => Boolean(item.request),
        )
        .sort(
          (left, right) =>
            new Date(right.request.updatedAt).getTime() -
            new Date(left.request.updatedAt).getTime(),
        )
    : []

  return (
    <Card as="section" aria-labelledby="pending-actions-heading" className="border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700"><span className="size-2 rounded-full bg-amber-500" /> {t('dashboard.actionRequired')}</div>
        <h2
            id="pending-actions-heading"
            className="text-base font-semibold text-slate-950"
          >
            {t('dashboard.pendingActions')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('dashboard.assignedForReview')}
          </p>
        </div>
        {pendingItems.length > 0 ? (
          <Badge variant="warning">{pendingItems.length} {t('dashboard.waiting')}</Badge>
        ) : null}
      </div>
      {pendingItems.length === 0 ? (
        <EmptyState
          className="px-2 py-8"
          title={t('dashboard.caughtUp')}
          description={t('dashboard.newTasksHint')}
        />
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {pendingItems.slice(0, 4).map(({ instance, step, request }) => (
            <li key={`${instance.id}-${step.id}`} className="py-3 first:pt-0 last:pb-0">
              <Link
                to={inboxDetailsPath(request.id)}
                className="group flex items-start gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"
                >
                  <ClipboardCheck className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-blue-700">
                    {content(request.title)}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {request.referenceCode} · {content(step.name)}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-2 size-4 shrink-0 text-slate-400 rtl:rotate-180"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
