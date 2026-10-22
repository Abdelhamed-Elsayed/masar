import type { ID, ISODateString } from './common'

export const ApproverType = {
  SPECIFIC_USER: 'SPECIFIC_USER',
  DEPARTMENT: 'DEPARTMENT',
  ROLE: 'ROLE',
  DIRECT_MANAGER: 'DIRECT_MANAGER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  REPRESENTATIVE: 'REPRESENTATIVE',
} as const

export type ApproverType = (typeof ApproverType)[keyof typeof ApproverType]

export const WorkflowStepStatus = {
  PENDING: 'PENDING',
  CURRENT: 'CURRENT',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SKIPPED: 'SKIPPED',
} as const

export type WorkflowStepStatus =
  (typeof WorkflowStepStatus)[keyof typeof WorkflowStepStatus]

export const WorkflowDecision = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
} as const

export type WorkflowDecision =
  (typeof WorkflowDecision)[keyof typeof WorkflowDecision]

export type ApproverTarget =
  | { type: typeof ApproverType.SPECIFIC_USER; userId: ID }
  | { type: typeof ApproverType.DEPARTMENT; departmentId: ID }
  | { type: typeof ApproverType.ROLE; roleId: ID }
  | { type: typeof ApproverType.DIRECT_MANAGER }
  | { type: typeof ApproverType.DEPARTMENT_HEAD; departmentId?: ID }
  | { type: typeof ApproverType.REPRESENTATIVE; userId: ID }

export interface WorkflowStepDefinition {
  id: ID
  order: number
  name: string
  approver: ApproverTarget
}

export interface WorkflowDefinition {
  id: ID
  name: string
  description: string
  requestTypeId: ID
  steps: WorkflowStepDefinition[]
}

export interface WorkflowStepInstance {
  id: ID
  definitionStepId: ID
  order: number
  name: string
  approver: ApproverTarget
  assignedUserId: ID | null
  status: WorkflowStepStatus
  actedByUserId: ID | null
  actedAt: ISODateString | null
  comment: string | null
}

export interface WorkflowInstance {
  id: ID
  definitionId: ID
  requestId: ID
  currentStepId: ID | null
  steps: WorkflowStepInstance[]
}
