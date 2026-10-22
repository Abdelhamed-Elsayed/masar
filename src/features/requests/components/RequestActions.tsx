import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Alert, Button, Card } from '@/components/ui'
import { ConfirmDialog } from '@/components/feedback'
import { useAuthStore } from '@/store/authStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { RequestStatus } from '@/types/request'
import { WorkflowStepStatus } from '@/types/workflow'
import type { Request } from '@/types/request'
import { RejectRequestModal } from './RejectRequestModal'
import { useTranslation } from '@/localization/useTranslation'

interface RequestActionsProps {
  request: Request
}

export function RequestActions({ request }: RequestActionsProps) {
  const { t, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const workflow = useWorkflowStore((state) =>
    request.workflowInstanceId
      ? state.getInstanceById(request.workflowInstanceId)
      : undefined,
  )
  const approve = useRequestStore((state) => state.approve)
  const reject = useRequestStore((state) => state.reject)
  const cancel = useRequestStore((state) => state.cancel)
  const hasPermission = useDirectoryStore((state) => state.hasPermission)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentStep = workflow?.steps.find(
    (step) => step.status === WorkflowStepStatus.CURRENT,
  )
  const canAct =
    request.status === RequestStatus.IN_PROGRESS &&
    Boolean(
      currentUser &&
      currentStep &&
      (currentStep.assignedUserId === currentUser.id || hasPermission(currentUser.id, 'company.manage')) &&
      hasPermission(currentUser.id, 'requests.approve'),
    )
  const canCancel =
    request.requesterId === currentUser?.id &&
    (request.status === RequestStatus.DRAFT || request.status === RequestStatus.IN_PROGRESS)

  if (!canAct && !canCancel) {
    return null
  }

  async function handleApprove() {
    setError(null)
    setIsSaving(true)
    try {
      if (!await approve(request.id)) setError(t('requests.approveFailed'))
    } catch (approveError) {
      console.error('Request approval failed', approveError)
      setError(t('requests.approveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReject(reason: string): Promise<boolean> {
    setIsSaving(true)
    try {
      const success = await reject(request.id, reason)
      setError(success ? null : t('requests.rejectFailed'))
      return success
    } catch (rejectError) {
      console.error('Request rejection failed', rejectError)
      setError(t('requests.rejectFailed'))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCancel() {
    setIsSaving(true)
    setError(null)
    try {
      if (await cancel(request.id)) {
        setIsCancelOpen(false)
      } else {
        setError(t('requests.cancelFailed'))
      }
    } catch (cancelError) {
      console.error('Request cancellation failed', cancelError)
      setError(t('requests.cancelFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {canAct ? (
        <Card as="section" aria-labelledby="request-actions-heading" className="p-5">
          <h2 id="request-actions-heading" className="text-base font-semibold text-slate-900">
            {t('requests.yourDecision')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {currentStep?.assignedUserId === currentUser?.id ? `${t('requests.currentApprover')} ${content(currentStep?.name ?? '')}.` : t('requests.adminOverride')}
          </p>
          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => void handleApprove()} loading={isSaving}>
              <Check size={16} aria-hidden="true" /> {t('requests.approve')}
            </Button>
            <Button type="button" variant="danger" disabled={isSaving} onClick={() => setIsRejectOpen(true)}>
              <X size={16} aria-hidden="true" /> {t('requests.rejectAction')}
            </Button>
          </div>
        </Card>
      ) : null}
      {canCancel ? (
        <Card as="section" aria-labelledby="request-cancel-heading" className="mt-4 p-5">
          <h2 id="request-cancel-heading" className="text-base font-semibold text-slate-900">
            {t('requests.cancelAction')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('requests.cancellingDescription')}
          </p>
          {error && !canAct ? <Alert variant="error" className="mt-4">{error}</Alert> : null}
          <Button type="button" className="mt-4" variant="danger" onClick={() => setIsCancelOpen(true)}>
            {t('requests.cancelAction')}
          </Button>
        </Card>
      ) : null}
      <RejectRequestModal
        open={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
      />
      <ConfirmDialog
        open={isCancelOpen}
        title={t('requests.confirmCancelTitle')}
        description={t('requests.confirmCancelDescription')}
        confirmLabel={t('requests.cancelAction')}
        onCancel={() => setIsCancelOpen(false)}
        onConfirm={() => void handleCancel()}
        isConfirming={isSaving}
      />
    </>
  )
}
