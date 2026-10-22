import type { ID, ISODateString } from './common'

export const NotificationType = {
  NEW_ACTION_REQUIRED: 'NEW_ACTION_REQUIRED',
  REQUEST_APPROVED: 'REQUEST_APPROVED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  REQUEST_MOVED: 'REQUEST_MOVED',
  FINAL_DECISION: 'FINAL_DECISION',
} as const

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType]

export interface Notification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  body: string
  requestId: ID | null
  isRead: boolean
  createdAt: ISODateString
}
