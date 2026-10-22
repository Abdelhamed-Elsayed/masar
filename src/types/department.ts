import type { ID } from './common'

export interface Department {
  id: ID
  name: string
  code: string
  headUserId: ID | null
  parentDepartmentId: ID | null
}
