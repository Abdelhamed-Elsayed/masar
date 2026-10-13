import type { Department } from '@/types/department'
import { userIds } from './users'

export const departmentIds = {
  engineering: 'dept-engineering',
  hr: 'dept-hr',
  executive: 'dept-executive',
} as const

export const mockDepartments: Department[] = [
  {
    id: departmentIds.engineering,
    name: 'Engineering',
    code: 'ENG',
    headUserId: userIds.daniel,
    parentDepartmentId: departmentIds.executive,
  },
  {
    id: departmentIds.hr,
    name: 'Human Resources',
    code: 'HR',
    headUserId: userIds.olivia,
    parentDepartmentId: departmentIds.executive,
  },
  {
    id: departmentIds.executive,
    name: 'Executive Office',
    code: 'EXE',
    headUserId: userIds.james,
    parentDepartmentId: null,
  },
]
