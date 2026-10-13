import type { ID, ISODateString, RequestFieldValue } from './common'

export const RequestStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus]

export interface RequestType {
  id: ID
  name: string
  code: string
  description: string
  workflowDefinitionId: ID
  formDefinitionId?: ID
}

export interface RequestAttachment {
  id: ID
  fileName: string
  fileSize: number
  uploadedAt: ISODateString
  mimeType?: string
}

export interface Request {
  id: ID
  referenceCode: string
  title: string
  requestTypeId: ID
  requesterId: ID
  departmentId: ID
  status: RequestStatus
  workflowInstanceId: ID | null
  submittedAt: ISODateString | null
  createdAt: ISODateString
  updatedAt: ISODateString
  fields: Record<string, RequestFieldValue>
  attachments: RequestAttachment[]
}
