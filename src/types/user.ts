import type { ID, ISODateString } from './common'

export type AccountApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RegistrationStage = 'HR_REVIEW' | 'DEPARTMENT_HEAD_REVIEW' | 'CEO_REVIEW' | 'APPROVED' | 'REJECTED'

export interface WorkExperienceItem {
  id: string
  role: string
  company: string
  period: string
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  year: string
}

export interface CertificationItem {
  id: string
  title: string
  issuer: string
  year: string
}

export type ProfileLocale = 'ar' | 'en'

/** The text of an employee profile in a single language. */
export interface ProfileContent {
  bio: string
  experiences: WorkExperienceItem[]
  skills: string[]
  education: EducationItem[]
  certifications: CertificationItem[]
}

export interface UserProfileData extends ProfileContent {
  /**
   * Per-language versions of the profile. A visitor sees the version that matches
   * the interface language; any field missing there falls back to the base fields above.
   */
  localized?: Partial<Record<ProfileLocale, Partial<ProfileContent>>>
}

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
  publicProfileVisible?: boolean
  approvalStatus?: AccountApprovalStatus
  registrationStage?: RegistrationStage
  registrationSubmittedAt?: ISODateString
  registrationDecisionNote?: string
  profile?: UserProfileData
}
