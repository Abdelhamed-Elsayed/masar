import { ApproverType } from '@/types/workflow'
import type { ApproverTarget } from '@/types/workflow'
import { Select } from '@/components/ui'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

interface ApproverSelectorProps {
  value: ApproverTarget
  onChange: (target: ApproverTarget) => void
  id: string
}

function isApproverType(value: string): value is ApproverType {
  return Object.values(ApproverType).some((type) => type === value)
}

export function ApproverSelector({ value, onChange, id }: ApproverSelectorProps) {
  const { t, content } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)

  function changeType(type: ApproverType) {
    switch (type) {
      case ApproverType.SPECIFIC_USER: {
        const user = users.find((item) => item.isActive)
        if (user) onChange({ type, userId: user.id })
        break
      }
      case ApproverType.REPRESENTATIVE: {
        const user = users.find((item) => item.isActive)
        if (user) onChange({ type, userId: user.id })
        break
      }
      case ApproverType.DEPARTMENT: {
        const department = departments[0]
        if (department) onChange({ type, departmentId: department.id })
        break
      }
      case ApproverType.ROLE: {
        const role = roles[0]
        if (role) onChange({ type, roleId: role.id })
        break
      }
      case ApproverType.DEPARTMENT_HEAD:
        onChange({ type })
        break
      case ApproverType.DIRECT_MANAGER:
        onChange({ type })
        break
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-type`} className="mb-1 block text-sm font-medium text-slate-700">
          {t('admin.approverType')}
        </label>
        <Select
          id={`${id}-type`}
          value={value.type}
          onChange={(event) => {
            const type = event.currentTarget.value
            if (isApproverType(type)) changeType(type)
          }}
        >
          <option value={ApproverType.SPECIFIC_USER}>{t('admin.specificUser')}</option>
          <option value={ApproverType.DEPARTMENT}>{t('admin.department')}</option>
          <option value={ApproverType.ROLE}>{t('admin.role')}</option>
          <option value={ApproverType.DIRECT_MANAGER}>{t('requests.targetManager')}</option>
          <option value={ApproverType.DEPARTMENT_HEAD}>{t('requests.targetDepartmentHead')}</option>
          <option value={ApproverType.REPRESENTATIVE}>{t('admin.representative')}</option>
        </Select>
      </div>
      {value.type === ApproverType.SPECIFIC_USER || value.type === ApproverType.REPRESENTATIVE ? (
        <div>
          <label htmlFor={`${id}-user`} className="mb-1 block text-sm font-medium text-slate-700">
            {value.type === ApproverType.REPRESENTATIVE ? t('admin.representative') : t('admin.user')}
          </label>
          <Select
            id={`${id}-user`}
            required
            value={value.userId}
            onChange={(event) => onChange({ ...value, userId: event.currentTarget.value })}
          >
            {users.filter((user) => user.isActive).map((user) => (
              <option key={user.id} value={user.id}>{content(user.fullName)}</option>
            ))}
          </Select>
        </div>
      ) : null}
      {value.type === ApproverType.DEPARTMENT ? (
        <div>
          <label htmlFor={`${id}-department`} className="mb-1 block text-sm font-medium text-slate-700">
            {t('admin.department')}
          </label>
          <Select
            id={`${id}-department`}
            required
            value={value.departmentId}
            onChange={(event) => onChange({ ...value, departmentId: event.currentTarget.value })}
          >
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{content(department.name)}</option>
            ))}
          </Select>
        </div>
      ) : null}
      {value.type === ApproverType.ROLE ? (
        <div>
          <label htmlFor={`${id}-role`} className="mb-1 block text-sm font-medium text-slate-700">
            {t('admin.role')}
          </label>
          <Select
            id={`${id}-role`}
            required
            value={value.roleId}
            onChange={(event) => onChange({ ...value, roleId: event.currentTarget.value })}
          >
            {roles.map((role) => <option key={role.id} value={role.id}>{content(role.name)}</option>)}
          </Select>
        </div>
      ) : null}
      {value.type === ApproverType.DEPARTMENT_HEAD ? (
        <div>
          <label htmlFor={`${id}-head-department`} className="mb-1 block text-sm font-medium text-slate-700">
            {t('admin.departmentScope')}
          </label>
          <Select
            id={`${id}-head-department`}
            value={value.departmentId ?? ''}
            onChange={(event) =>
              onChange(event.currentTarget.value
                ? { type: ApproverType.DEPARTMENT_HEAD, departmentId: event.currentTarget.value }
                : { type: ApproverType.DEPARTMENT_HEAD })
            }
          >
            <option value="">{t('admin.requesterDepartmentHead')}</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{content(department.name)}</option>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  )
}
