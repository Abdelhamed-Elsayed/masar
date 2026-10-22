import { describe, expect, it, beforeEach } from 'vitest'
import { useNotificationStore, createNotification } from './notificationStore'

beforeEach(() => {
  useNotificationStore.setState({ notifications: [], hydratedUserId: 'u1' })
})

describe('notification store', () => {
  it('keeps notifications scoped to the hydrated user', () => {
    useNotificationStore.getState().addNotification(createNotification({ userId: 'u2', type: 'REQUEST_MOVED', title: 'Other', body: 'Other', requestId: null }))
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  it('marks only the current user notifications as read', () => {
    const first = createNotification({ userId: 'u1', type: 'REQUEST_MOVED', title: 'A', body: 'A', requestId: null })
    const second = createNotification({ userId: 'u1', type: 'REQUEST_MOVED', title: 'B', body: 'B', requestId: null })
    useNotificationStore.setState({ notifications: [first, second], hydratedUserId: 'u1' })
    useNotificationStore.getState().markAllAsRead('u1')
    expect(useNotificationStore.getState().notifications.every((item) => item.isRead)).toBe(true)
  })
})
