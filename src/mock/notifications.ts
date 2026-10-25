import { NotificationType } from '@/types/notification'
import type { Notification } from '@/types/notification'
import { userIds } from './users'

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: userIds.abdelrahmanMohamed,
    type: NotificationType.NEW_ACTION_REQUIRED,
    title: 'Approval required',
    body: 'REQ-1042 Leave Request is waiting for Department Manager approval.',
    requestId: 'req-1042',
    isRead: false,
    createdAt: '2026-09-19T11:41:00.000Z',
  },
  {
    id: 'notif-2',
    userId: userIds.ahmedAyman,
    type: NotificationType.REQUEST_MOVED,
    title: 'Request progressed',
    body: 'HR approved REQ-1042. It is now with the Department Manager.',
    requestId: 'req-1042',
    isRead: true,
    createdAt: '2026-09-19T11:42:00.000Z',
  },
  {
    id: 'notif-3',
    userId: userIds.abdelrahmanGhoneim,
    type: NotificationType.NEW_ACTION_REQUIRED,
    title: 'Approval required',
    body: 'REQ-1043 Laptop replacement is waiting for HR review.',
    requestId: 'req-1043',
    isRead: false,
    createdAt: '2026-09-22T08:06:00.000Z',
  },
  {
    id: 'notif-4',
    userId: userIds.mohamedAbdelfattah,
    type: NotificationType.REQUEST_APPROVED,
    title: 'Request approved',
    body: 'REQ-1044 Leave Request was fully approved.',
    requestId: 'req-1044',
    isRead: true,
    createdAt: '2026-09-12T16:46:00.000Z',
  },
]
