import { Badge, Button } from '@/components/ui'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'

interface UserDetailsProps {
  user: User
  users: User[]
  departments: Department[]
  roles: Role[]
  onClose: () => void
}

export function UserDetails({
  user,
  users,
  departments,
  roles,
  onClose,
}: UserDetailsProps) {
  const { t, content } = useTranslation()
  const roleNames = user.roleIds.map((id) => roles.find((role) => role.id === id)?.name ?? id)
  const registrationStage = user.registrationStage === 'HR_REVIEW'
    ? t('registration.hrReview')
    : user.registrationStage === 'DEPARTMENT_HEAD_REVIEW'
      ? t('registration.departmentHeadReview')
      : user.registrationStage === 'CEO_REVIEW'
        ? t('registration.ceoAssignment')
        : user.registrationStage === 'APPROVED'
          ? t('registration.approved')
          : user.registrationStage === 'REJECTED'
            ? t('registration.rejected')
            : t('admin.notApplicable')
  const details: Array<[string, string]> = [
    [t('admin.name'), user.fullName],
    [t('admin.email'), user.email],
    [t('admin.employeeId'), user.employeeId],
    [t('admin.jobTitle'), content(user.jobTitle)],
    [t('admin.department'), content(departments.find((department) => department.id === user.departmentId)?.name ?? t('admin.unassigned'))],
    [t('admin.manager'), users.find((item) => item.id === user.managerId)?.fullName ?? t('common.none')],
    [t('admin.registrationStage'), registrationStage],
  ]

  return (
    <div className="space-y-4">
      <dl className="grid gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">{t('admin.roles')}</p>
        <div className="flex flex-wrap gap-2">
          {user.roleIds.map((id) => (
            <Badge key={id}>{content(roles.find((role) => role.id === id)?.name ?? id)}</Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-slate-500">{t('admin.accessProfile')}</p>
        <div className="flex flex-wrap gap-2">
          {roleNames.map((name) => <Badge key={name} variant="success">{content(name)}</Badge>)}
        </div>
        <p className="mt-2 text-xs text-slate-500">{t('admin.inheritedPermissions')}</p>
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>{t('admin.close')}</Button>
      </div>
    </div>
  )
}
