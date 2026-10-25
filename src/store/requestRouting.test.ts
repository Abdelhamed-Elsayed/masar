import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDepartments } from '@/mock/departments'
import { mockRequestTypes } from '@/mock/workflows'
import { mockRoles, mockUsers, userIds } from '@/mock/users'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { useRequestStore } from '@/store/requestStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { useNotificationStore } from '@/store/notificationStore'
import * as requestStorage from '@/utils/requestStorage'
import { RequestStatus } from '@/types/request'
import { NotificationType } from '@/types/notification'
import { WorkflowStepStatus } from '@/types/workflow'

describe('request workflow routing', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.spyOn(requestStorage, 'putStoredRequest').mockResolvedValue()
    useDirectoryStore.setState((state) => ({
      ...state,
      users: mockUsers,
      roles: mockRoles,
      departments: mockDepartments,
      requestTypes: mockRequestTypes,
      companyOwnerId: userIds.abdelhamid,
    }))
    useWorkflowStore.setState((state) => ({
      ...state,
      instances: [],
    }))
    useRequestStore.setState({ requests: [], hydratedUserId: null })
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.ahmedAyman)!, isInitializing: false })
  })

  it('routes a leave request to its assigned approvers in sequence until fully approved', async () => {
    const request = await useRequestStore.getState().createDraft({
      requestTypeId: 'request-type-leave',
      title: 'Leave Request',
      departmentId: 'dept-engineering',
      fields: { 'leave-type': 'Annual', 'start-date': '2026-11-01', 'end-date': '2026-11-05' },
      attachments: [],
    })

    expect(request).not.toBeNull()
    expect(await useRequestStore.getState().submitRequest(request!.id)).toBe(true)
    expect(useRequestStore.getState().getRequestById(request!.id)?.status).toBe(RequestStatus.IN_PROGRESS)

    const expectedApproverIds = [userIds.mahmoudAyman, userIds.mostafaKamel, userIds.abdelrahmanMohamed, userIds.abdelhamid]
    for (const [index, approverId] of expectedApproverIds.entries()) {
      const instance = useWorkflowStore.getState().getInstanceByRequestId(request!.id)!
      const currentStep = instance.steps.find((step) => step.status === WorkflowStepStatus.CURRENT)
      expect(currentStep?.assignedUserId).toBe(approverId)
      useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === approverId)!, isInitializing: false })
      expect(await useRequestStore.getState().approve(request!.id)).toBe(true)

      const routedInstance = useWorkflowStore.getState().getInstanceByRequestId(request!.id)!
      if (index < expectedApproverIds.length - 1) {
        expect(routedInstance.steps.find((step) => step.status === WorkflowStepStatus.CURRENT)?.assignedUserId)
          .toBe(expectedApproverIds[index + 1])
      }
    }

    expect(useRequestStore.getState().getRequestById(request!.id)?.status).toBe(RequestStatus.APPROVED)
    expect(useWorkflowStore.getState().getInstanceByRequestId(request!.id)?.currentStepId).toBeNull()
  })

  it('notifies higher workflow approvers when the direct manager rejects without leaving an actionable step', async () => {
    const notifications: Array<{ userId: string; type: string; requestId: string | null }> = []
    vi.spyOn(useNotificationStore.getState(), 'addNotification').mockImplementation((notification) => {
      notifications.push({ userId: notification.userId, type: notification.type, requestId: notification.requestId })
    })
    const request = await useRequestStore.getState().createDraft({
      requestTypeId: 'request-type-leave',
      title: 'Leave Request',
      departmentId: 'dept-engineering',
      fields: {},
      attachments: [],
    })

    expect(request).not.toBeNull()
    expect(await useRequestStore.getState().submitRequest(request!.id)).toBe(true)
    useAuthStore.setState({ currentUser: mockUsers.find((user) => user.id === userIds.mahmoudAyman)!, isInitializing: false })

    expect(await useRequestStore.getState().reject(request!.id, 'Dates overlap with a critical delivery.')).toBe(true)
    expect(useRequestStore.getState().getRequestById(request!.id)?.status).toBe(RequestStatus.REJECTED)

    const rejectedNotifications = notifications.filter((notification) => notification.type === NotificationType.REQUEST_REJECTED)
    expect(rejectedNotifications.map((notification) => notification.userId)).toEqual([
      userIds.mostafaKamel,
      userIds.abdelrahmanMohamed,
      userIds.abdelhamid,
    ])
    expect(rejectedNotifications.every((notification) => notification.requestId === null)).toBe(true)
    const instance = useWorkflowStore.getState().getInstanceByRequestId(request!.id)
    expect(instance?.currentStepId).toBeNull()
    expect(instance?.steps.some((step) => step.status === WorkflowStepStatus.CURRENT)).toBe(false)
  })

  it('does not create a draft in memory when browser persistence fails', async () => {
    vi.spyOn(requestStorage, 'putStoredRequest').mockRejectedValueOnce(new Error('Storage unavailable'))

    await expect(useRequestStore.getState().createDraft({
      requestTypeId: 'request-type-leave',
      title: 'Leave Request',
      departmentId: 'dept-engineering',
      fields: {},
      attachments: [],
    })).rejects.toThrow('Storage unavailable')

    expect(useRequestStore.getState().requests).toHaveLength(0)
  })
})
