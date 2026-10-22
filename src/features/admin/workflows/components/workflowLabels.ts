import { ApproverType } from '@/types/workflow'
import type { ApproverTarget } from '@/types/workflow'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import type { TranslationKey } from '@/localization/translations'

interface DirectoryLookups {
  users: readonly User[]
  departments: readonly Department[]
  roles: readonly Role[]
}

export function approverLabel(
  target: ApproverTarget,
  directory: DirectoryLookups,
  t: (key: TranslationKey) => string,
  content: (value: string) => string,
): string {
  switch (target.type) {
    case ApproverType.SPECIFIC_USER:
    case ApproverType.REPRESENTATIVE:
      const user = directory.users.find((item) => item.id === target.userId)
      return user ? content(user.fullName) : t('admin.chooseUser')
    case ApproverType.DEPARTMENT:
      return content(directory.departments.find((department) => department.id === target.departmentId)?.name ?? t('admin.chooseDepartment'))
    case ApproverType.ROLE:
      return content(directory.roles.find((role) => role.id === target.roleId)?.name ?? t('admin.chooseRole'))
    case ApproverType.DEPARTMENT_HEAD:
      return target.departmentId
        ? `${t('admin.departmentHead')}: ${content(directory.departments.find((department) => department.id === target.departmentId)?.name ?? t('admin.department'))}`
        : t('admin.requesterDepartmentHead')
    case ApproverType.DIRECT_MANAGER:
      return t('requests.targetManager')
  }
}
