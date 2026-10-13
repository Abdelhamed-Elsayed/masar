import { useDirectoryStore } from '@/store/directoryStore'
import type { ApproverTarget } from '@/types/workflow'
import { useTranslation } from '@/localization/useTranslation'

interface ApproverInfoProps {
  target: ApproverTarget
  assignedUserId: string | null
}

function targetLabel(target: ApproverTarget, t: ReturnType<typeof useTranslation>['t']): string {
  switch (target.type) {
    case 'SPECIFIC_USER':
      return t('requests.targetUser')
    case 'DEPARTMENT':
      return t('requests.targetDepartment')
    case 'ROLE':
      return t('requests.targetRole')
    case 'DIRECT_MANAGER':
      return t('requests.targetManager')
    case 'DEPARTMENT_HEAD':
      return t('requests.targetDepartmentHead')
    case 'REPRESENTATIVE':
      return t('requests.targetRepresentative')
  }
}

function targetDescription(
  target: ApproverTarget,
  users: ReturnType<typeof useDirectoryStore.getState>['users'],
  departments: ReturnType<typeof useDirectoryStore.getState>['departments'],
  roles: ReturnType<typeof useDirectoryStore.getState>['roles'],
): string | undefined {
  switch (target.type) {
    case 'SPECIFIC_USER':
    case 'REPRESENTATIVE':
      return users.find((user) => user.id === target.userId)?.fullName
    case 'DEPARTMENT':
      return departments.find((department) => department.id === target.departmentId)?.name
    case 'ROLE':
      return roles.find((role) => role.id === target.roleId)?.name
    case 'DEPARTMENT_HEAD':
      return target.departmentId
        ? departments.find((department) => department.id === target.departmentId)?.name
        : 'Requester department'
    case 'DIRECT_MANAGER':
      return undefined
  }
}

export function ApproverInfo({ target, assignedUserId }: ApproverInfoProps) {
  const { t, content } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const assignedUser = assignedUserId
    ? users.find((user) => user.id === assignedUserId)
    : undefined
  const rawDescription = targetDescription(target, users, departments, roles)
  const description = rawDescription === 'Requester department'
    ? t('requests.requesterDepartment')
    : rawDescription
      ? content(rawDescription)
      : undefined

  return (
    <div className="text-sm">
      <p className="font-medium text-slate-800">
        {assignedUser?.fullName ?? description ?? t('requests.approverNotAssigned')}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {targetLabel(target, t)}
        {assignedUser && description ? ` · ${description}` : ''}
      </p>
    </div>
  )
}
