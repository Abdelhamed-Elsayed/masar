import type { Department } from '@/types/department'
import { userIds } from './users'

export const departmentIds = {
  engineering: 'dept-engineering',
  development: 'dept-developing-team',
  hr: 'dept-hr',
  executive: 'dept-executive',
} as const

export const mockDepartments: Department[] = [
  {
    id: departmentIds.engineering,
    name: 'Engineering',
    code: 'ENG',
    headUserId: userIds.abdelrahmanMohamed,
    parentDepartmentId: departmentIds.executive,
  },
  {
    id: departmentIds.development,
    name: 'Development Team',
    code: 'DEV',
    headUserId: userIds.mahmoudAyman,
    parentDepartmentId: departmentIds.executive,
  },
  {
    id: departmentIds.hr,
    name: 'Human Resources',
    code: 'HR',
    headUserId: userIds.abdelrahmanGhoneim,
    parentDepartmentId: departmentIds.executive,
  },
  {
    id: departmentIds.executive,
    name: 'Executive Office',
    code: 'EXE',
    headUserId: userIds.abdelhamid,
    parentDepartmentId: null,
  },
]
