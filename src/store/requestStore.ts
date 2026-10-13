import { create } from 'zustand'
import { mockRequests } from '@/mock/requests'
import { RequestStatus, type Request, type RequestAttachment } from '@/types/request'
import { ApproverType, WorkflowDecision, WorkflowStepStatus, type WorkflowInstance, type WorkflowStepInstance } from '@/types/workflow'
import { NotificationType } from '@/types/notification'
import { useAuthStore } from './authStore'
import { useDirectoryStore } from './directoryStore'
import { useWorkflowStore } from './workflowStore'
import { useNotificationStore, createNotification } from './notificationStore'
import { saveAttachmentFile } from '@/utils/attachmentStorage'
import { useAuditStore } from './auditStore'
import { listStoredRequests, putStoredRequest, putStoredRequests } from '@/utils/requestStorage'

export interface CreateRequestInput {
  requestTypeId: string
  title: string
  departmentId: string
  fields: Request['fields']
  attachments: RequestAttachment[]
  files?: File[]
}

interface RequestState {
  requests: Request[]
  hydratedUserId: string | null
  hydrateForUser: (userId: string | null) => Promise<void>
  getRequestById: (id: string) => Request | undefined
  createDraft: (input: CreateRequestInput) => Promise<Request | null>
  updateDraft: (requestId: string, input: CreateRequestInput) => Promise<Request | null>
  submitRequest: (requestId: string) => Promise<boolean>
  approve: (requestId: string, comment?: string) => Promise<boolean>
  reject: (requestId: string, reason: string) => Promise<boolean>
  cancel: (requestId: string) => Promise<boolean>
}

function resolveApprover(step: WorkflowInstance['steps'][number], request: Request): string | null {
  const directory = useDirectoryStore.getState()
  const users = directory.users.filter((user) => user.isActive)
  switch (step.approver.type) {
    case ApproverType.SPECIFIC_USER:
    case ApproverType.REPRESENTATIVE: {
      const { userId } = step.approver
      return users.some((user) => user.id === userId) ? userId : null
    }
    case ApproverType.DIRECT_MANAGER:
      return users.find((user) => user.id === directory.users.find((item) => item.id === request.requesterId)?.managerId)?.id ?? null
    case ApproverType.DEPARTMENT_HEAD: {
      const departmentId = step.approver.departmentId ?? request.departmentId
      return directory.departments.find((department) => department.id === departmentId)?.headUserId ??
        users.find((user) => user.departmentId === departmentId && user.roleIds.includes('role-department-head'))?.id ?? null
    }
    case ApproverType.DEPARTMENT: {
      const { departmentId } = step.approver
      return users.find((user) => user.departmentId === departmentId)?.id ?? null
    }
    case ApproverType.ROLE: {
      const { roleId } = step.approver
      return users.find((user) => user.roleIds.includes(roleId))?.id ?? null
    }
  }
}

function buildWorkflowInstance(request: Request): WorkflowInstance | null {
  const type = useDirectoryStore.getState().requestTypes.find((item) => item.id === request.requestTypeId)
  const definition = type ? useWorkflowStore.getState().getDefinitionById(type.workflowDefinitionId) : undefined
  if (!definition) return null
  const steps: WorkflowStepInstance[] = definition.steps.map((step, index) => ({
    id: `wf-inst-${request.id}-${step.id}`,
    definitionStepId: step.id,
    order: index + 1,
    name: step.name,
    approver: step.approver,
    assignedUserId: null,
    status: WorkflowStepStatus.PENDING,
    actedByUserId: null,
    actedAt: null,
    comment: null,
  }))
  const first = steps[0]
  if (!first) return null
  first.status = WorkflowStepStatus.CURRENT
  first.assignedUserId = resolveApprover(first, request)
  return {
    id: `wf-inst-${crypto.randomUUID()}`,
    definitionId: definition.id,
    requestId: request.id,
    currentStepId: first.id,
    steps,
  }
}

function notifyAssignedApprover(request: Request, step: WorkflowStepInstance | undefined) {
  if (!step?.assignedUserId) return
  useNotificationStore.getState().addNotification(createNotification({
    userId: step.assignedUserId,
    type: NotificationType.NEW_ACTION_REQUIRED,
    title: 'Approval required',
    body: `${request.referenceCode} ${request.title} is waiting for your review.`,
    requestId: request.id,
  }))
}

export const useRequestStore = create<RequestState>()(
    (set, get) => ({
      requests: mockRequests,
      hydratedUserId: null,
      hydrateForUser: async (userId) => {
        if (!userId) { set({ hydratedUserId: null, requests: [] }); return }
        try {
          let stored = await listStoredRequests()
          if (stored.length === 0 && mockRequests.length > 0) {
            await putStoredRequests(mockRequests)
            stored = mockRequests
          }
          set({ requests: stored, hydratedUserId: userId })
        } catch {
          set({ requests: mockRequests, hydratedUserId: userId })
        }
      },
      getRequestById: (id) => get().requests.find((item) => item.id === id),
      createDraft: async (input) => {
        const requester = useAuthStore.getState().currentUser
        const requestType = useDirectoryStore.getState().requestTypes.find((item) => item.id === input.requestTypeId)
        if (!requester || !requestType) return null
        const now = new Date().toISOString()
        const request: Request = {
          id: `req-${crypto.randomUUID()}`,
          referenceCode: `REQ-${Date.now().toString().slice(-6)}`,
          title: input.title,
          requestTypeId: input.requestTypeId,
          requesterId: requester.id,
          departmentId: input.departmentId,
          status: RequestStatus.DRAFT,
          workflowInstanceId: null,
          submittedAt: null,
          createdAt: now,
          updatedAt: now,
          fields: input.fields,
          attachments: input.attachments,
        }
        // Browser storage cannot safely hold File objects in localStorage.
        // Keep attachment metadata here; binary persistence can be added with IndexedDB.
        if (input.files?.length) {
          request.attachments = input.files.map((file, index) => ({
            id: input.attachments[index]?.id ?? `att-${crypto.randomUUID()}`,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            uploadedAt: now,
          }))
          await Promise.all(input.files.map((file, index) => saveAttachmentFile(request.attachments[index]?.id ?? `att-${index}`, file)))
        }
        await putStoredRequest(request)
        set((state) => ({ requests: [...state.requests, request] }))
        useAuditStore.getState().addEntry({
          action: 'Request created',
          actorId: requester.id,
          targetId: request.id,
          targetType: 'request',
          details: request.referenceCode,
        })
        useNotificationStore.getState().addNotification(createNotification({
          userId: requester.id,
          type: NotificationType.REQUEST_MOVED,
          title: 'Draft saved',
          body: `${request.referenceCode} has been saved as a draft.`,
          requestId: request.id,
        }))
        return request
      },
      updateDraft: async (requestId, input) => {
        const requester = useAuthStore.getState().currentUser
        const requestType = useDirectoryStore.getState().requestTypes.find((item) => item.id === input.requestTypeId)
        const existing = get().requests.find((item) => item.id === requestId)
        if (!requester || !requestType || !existing || existing.requesterId !== requester.id || existing.status !== RequestStatus.DRAFT) return null
        const now = new Date().toISOString()
        const attachments = input.files?.length
          ? input.files.map((file, index) => ({ id: input.attachments[index]?.id ?? `att-${crypto.randomUUID()}`, fileName: file.name, fileSize: file.size, mimeType: file.type, uploadedAt: now }))
          : input.attachments
        if (input.files?.length) {
          await Promise.all(input.files.map((file, index) => saveAttachmentFile(attachments[index]?.id ?? `att-${index}`, file)))
        }
        const updated: Request = { ...existing, title: input.title, requestTypeId: input.requestTypeId, departmentId: input.departmentId, fields: input.fields, attachments, updatedAt: now }
        await putStoredRequest(updated)
        set((state) => ({ requests: state.requests.map((item) => item.id === requestId ? updated : item) }))
        return updated
      },
      submitRequest: async (requestId) => {
        const currentUser = useAuthStore.getState().currentUser
        const request = get().requests.find((item) => item.id === requestId)
        if (!currentUser || !request || request.requesterId !== currentUser.id || request.status !== RequestStatus.DRAFT) return false
        const instance = buildWorkflowInstance(request)
        if (!instance || instance.steps.some((step) => !resolveApprover(step, request))) return false
        const now = new Date().toISOString()
        const updated = { ...request, status: RequestStatus.IN_PROGRESS, workflowInstanceId: instance.id, submittedAt: now, updatedAt: now }
        await putStoredRequest(updated)
        useWorkflowStore.getState().addInstance(instance)
        set((state) => ({ requests: state.requests.map((item) => item.id === requestId ? updated : item) }))
        useAuditStore.getState().addEntry({ action: 'Request submitted', actorId: currentUser.id, targetId: request.id, targetType: 'request', details: request.referenceCode })
        notifyAssignedApprover(updated, instance.steps.find((step) => step.status === WorkflowStepStatus.CURRENT))
        return true
      },
      approve: async (requestId, comment) => applyDecision(requestId, WorkflowDecision.APPROVE, comment, set, get),
      reject: async (requestId, reason) => {
        if (!reason.trim()) return false
        return applyDecision(requestId, WorkflowDecision.REJECT, reason.trim(), set, get)
      },
      cancel: async (requestId) => {
        const currentUser = useAuthStore.getState().currentUser
        const request = get().requests.find((item) => item.id === requestId)
        if (!currentUser || !request || request.requesterId !== currentUser.id) return false
        const cancellableStatuses: RequestStatus[] = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.IN_PROGRESS]
        if (!cancellableStatuses.includes(request.status)) return false
        const now = new Date().toISOString()
        const updated = { ...request, status: RequestStatus.CANCELLED, updatedAt: now }
        await putStoredRequest(updated)
        set((state) => ({ requests: state.requests.map((item) => item.id === requestId ? { ...item, status: RequestStatus.CANCELLED, updatedAt: now } : item) }))
        useAuditStore.getState().addEntry({ action: 'Request cancelled', actorId: currentUser.id, targetId: request.id, targetType: 'request', details: request.referenceCode })
        if (request.workflowInstanceId) {
          const instance = useWorkflowStore.getState().getInstanceById(request.workflowInstanceId)
          if (instance) useWorkflowStore.getState().updateInstance({ ...instance, currentStepId: null, steps: instance.steps.map((step) => step.status === WorkflowStepStatus.CURRENT ? { ...step, status: WorkflowStepStatus.SKIPPED } : step) })
        }
        return true
      },
    }),
)

async function applyDecision(
  requestId: string,
  decision: (typeof WorkflowDecision)[keyof typeof WorkflowDecision],
  comment: string | undefined,
  set: (partial: Partial<RequestState> | ((state: RequestState) => Partial<RequestState>)) => void,
  get: () => RequestState,
): Promise<boolean> {
  const actor = useAuthStore.getState().currentUser
  const request = get().requests.find((item) => item.id === requestId)
  if (!actor || !request || !request.workflowInstanceId) return false
  const instance = useWorkflowStore.getState().getInstanceById(request.workflowInstanceId)
  const current = instance?.steps.find((step) => step.status === WorkflowStepStatus.CURRENT)
  const directory = useDirectoryStore.getState()
  const canApprove = directory.hasPermission(actor.id, 'requests.approve')
  const canManageCompany = directory.hasPermission(actor.id, 'company.manage')
  const canOverride = canManageCompany
  if (!instance || !current || !canApprove || (!canOverride && current.assignedUserId !== actor.id) || (decision === WorkflowDecision.REJECT && !comment?.trim())) return false

  const now = new Date().toISOString()
  const actedStep: WorkflowStepInstance = {
    ...current,
    status: decision === WorkflowDecision.APPROVE ? WorkflowStepStatus.APPROVED : WorkflowStepStatus.REJECTED,
    actedByUserId: actor.id,
    actedAt: now,
    comment: comment?.trim() || null,
  }
  const steps = instance.steps.map((step) => step.id === current.id ? actedStep : step)
  let nextStatus: RequestStatus = decision === WorkflowDecision.REJECT ? RequestStatus.REJECTED : RequestStatus.IN_PROGRESS
  let nextCurrentId: string | null = null
  let nextStep: WorkflowStepInstance | undefined
  let updatedSteps = steps
  if (decision === WorkflowDecision.APPROVE) {
    nextStep = steps.find((step) => step.order > current.order && step.status === WorkflowStepStatus.PENDING)
    if (nextStep) {
      const assignedUserId = resolveApprover(nextStep, request)
      if (!assignedUserId) return false
      nextStep = { ...nextStep, status: WorkflowStepStatus.CURRENT, assignedUserId }
      nextCurrentId = nextStep.id
      updatedSteps = steps.map((step) => step.id === nextStep?.id ? nextStep : step)
    } else {
      nextStatus = RequestStatus.APPROVED
    }
  }
  const updatedRequest = { ...request, status: nextStatus, updatedAt: now }
  await putStoredRequest(updatedRequest)
  useWorkflowStore.getState().updateInstance({ ...instance, steps: updatedSteps, currentStepId: nextCurrentId })
  set((state) => ({ requests: state.requests.map((item) => item.id === requestId ? updatedRequest : item) }))
  useAuditStore.getState().addEntry({
    action: decision === WorkflowDecision.APPROVE ? (nextStatus === RequestStatus.APPROVED ? 'Request approved' : 'Workflow step approved') : 'Request rejected',
    actorId: actor.id,
    targetId: request.id,
    targetType: 'request',
    details: [request.referenceCode, canOverride && current.assignedUserId !== actor.id ? 'Administrator override' : null, comment?.trim()].filter(Boolean).join(' · '),
  })

  if (nextStep) {
    notifyAssignedApprover(request, nextStep)
    useNotificationStore.getState().addNotification(createNotification({
      userId: request.requesterId,
      type: NotificationType.REQUEST_MOVED,
      title: 'Request progressed',
      body: `${request.referenceCode} moved to ${nextStep.name}.`,
      requestId: request.id,
    }))
  } else {
    useNotificationStore.getState().addNotification(createNotification({
      userId: request.requesterId,
      type: nextStatus === RequestStatus.APPROVED ? NotificationType.REQUEST_APPROVED : NotificationType.REQUEST_REJECTED,
      title: nextStatus === RequestStatus.APPROVED ? 'Request approved' : 'Request rejected',
      body: `${request.referenceCode} was ${nextStatus === RequestStatus.APPROVED ? 'fully approved' : 'rejected'}.`,
      requestId: request.id,
    }))
  }
  return true
}
