import { Link, useLocation, useParams } from 'react-router'
import { EmptyState, Spinner } from '@/components/ui'
import { PageContainer } from '@/components/layout'
import { ROUTES } from '@/constants/routes'
import {
  RequestActions,
  RequestAttachments,
  RequestHeader,
  RequestHistory,
  RequestSummary,
  WorkflowTimeline,
} from '@/features/requests'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

export function RequestDetailsPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const hasPermission = useDirectoryStore((state) => state.hasPermission)
  const hydratedUserId = useRequestStore((state) => state.hydratedUserId)
  const request = useRequestStore((state) =>
    id ? state.getRequestById(id) : undefined,
  )
  const workflow = useWorkflowStore((state) =>
    request?.workflowInstanceId
      ? state.getInstanceById(request.workflowInstanceId)
      : undefined,
  )
  const canView = Boolean(
    request &&
    currentUser &&
    (
      request.requesterId === currentUser.id ||
      hasPermission(currentUser.id, 'company.manage') ||
      workflow?.steps.some((step) =>
        step.assignedUserId === currentUser.id || step.actedByUserId === currentUser.id,
      )
    ),
  )

  if (currentUser && hydratedUserId !== currentUser.id) {
    return <div className="grid min-h-72 place-items-center"><Spinner label={t('requests.loading')} /></div>
  }

  if (!request || !canView) {
    return (
      <PageContainer>
        <EmptyState
          title={t('requests.notFound')}
          description={t('requests.notFoundDescription')}
          action={
            <Link
              to={ROUTES.REQUESTS}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {t('requests.backMine')}
            </Link>
          }
        />
      </PageContainer>
    )
  }

  const backPath = location.pathname.startsWith('/inbox') ? ROUTES.INBOX : location.pathname.startsWith('/outbox') ? ROUTES.OUTBOX : ROUTES.REQUESTS
  const backLabel = backPath === ROUTES.INBOX ? t('requests.backInbox') : backPath === ROUTES.OUTBOX ? t('requests.backOutbox') : t('requests.backMine')

  return (
    <PageContainer>
      <div className="mb-4"><Link to={backPath} className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950"><span aria-hidden="true" className="rtl:rotate-180">←</span> {backLabel}</Link></div>
      <div className="space-y-6">
        <RequestHeader request={request} />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
          <div className="min-w-0 space-y-6">
            <RequestSummary request={request} />
            <RequestAttachments requestId={request.id} attachments={request.attachments} />
            <WorkflowTimeline workflow={workflow} />
            <RequestHistory request={request} workflow={workflow} />
          </div>
          <div className="min-w-0 xl:sticky xl:top-6">
            <RequestActions request={request} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
