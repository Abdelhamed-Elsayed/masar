import type { ID, ISODateString } from './common'

export type AccountApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RegistrationStage = 'HR_REVIEW' | 'DEPARTMENT_HEAD_REVIEW' | 'CEO_REVIEW' | 'APPROVED' | 'REJECTED'

export interface User {
  id: ID
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  jobTitle: string
  departmentId: ID
  managerId: ID | null
  roleIds: ID[]
  isActive: boolean
  avatarUrl: string | null
  approvalStatus?: AccountApprovalStatus
  registrationStage?: RegistrationStage
  registrationSubmittedAt?: ISODateString
  registrationDecisionNote?: string
}
