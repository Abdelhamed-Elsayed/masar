import type { ID } from './common'
import type { User } from './user'

export interface Role {
  id: ID
  name: string
  code: AuthRoleCode | string
  description: string
}

export interface AuthSession {
  user: User
  roles: Role[]
}

export type AuthStatus = 'anonymous' | 'authenticated'

export type AuthRoleCode = 'EMPLOYEE' | 'APPROVER' | 'ADMIN' | 'CEO'
