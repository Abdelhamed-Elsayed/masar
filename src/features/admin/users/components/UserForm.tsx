import type { FormEvent } from 'react'
import { Button, Checkbox, Input, Select } from '@/components/ui'
import { FormField, FormLabel } from '@/components/forms/primitives'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import { roleIds } from '@/mock/users'
import { useTranslation } from '@/localization/useTranslation'

export type UserDraft = Omit<User, 'id' | 'fullName' | 'avatarUrl'> & { password: string }

interface UserFormProps {
  draft: UserDraft
  departments: Department[]
  roles: Role[]
  users: User[]
  editingUserId?: string
  companyOwnerId?: string
  error: string
  isEditing: boolean
  onDraftChange: (updates: Partial<UserDraft>) => void
  onToggleRole: (roleId: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function UserForm({
  draft,
  departments,
  roles,
  users,
  editingUserId,
  companyOwnerId,
  error,
  isEditing,
  onDraftChange,
  onToggleRole,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const { t, content } = useTranslation()
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="user-first-name" required>{t('admin.firstName')}</FormLabel>
          <Input id="user-first-name" autoComplete="given-name" value={draft.firstName} onChange={(event) => onDraftChange({ firstName: event.currentTarget.value })} required />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-last-name" required>{t('admin.lastName')}</FormLabel>
          <Input id="user-last-name" autoComplete="family-name" value={draft.lastName} onChange={(event) => onDraftChange({ lastName: event.currentTarget.value })} required />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-email" required>{t('admin.email')}</FormLabel>
          <Input id="user-email" type="email" autoComplete="email" value={draft.email} onChange={(event) => onDraftChange({ email: event.currentTarget.value })} required />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-employee-id" required>{t('admin.employeeId')}</FormLabel>
          <Input id="user-employee-id" value={draft.employeeId} onChange={(event) => onDraftChange({ employeeId: event.currentTarget.value })} required />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-password" required={!isEditing}>{t('admin.password')}</FormLabel>
          <Input id="user-password" type="password" autoComplete="new-password" value={draft.password} onChange={(event) => onDraftChange({ password: event.currentTarget.value })} minLength={8} placeholder={isEditing ? t('admin.keepPassword') : t('admin.minimumPassword')} required={!isEditing} />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-job-title" required>{t('admin.jobTitle')}</FormLabel>
          <Input id="user-job-title" value={draft.jobTitle} onChange={(event) => onDraftChange({ jobTitle: event.currentTarget.value })} required />
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-department" required>{t('admin.department')}</FormLabel>
          <Select id="user-department" value={draft.departmentId} onChange={(event) => onDraftChange({ departmentId: event.currentTarget.value })} required>
            <option value="">{t('admin.chooseDepartment')}</option>
            {departments.map((department) => <option key={department.id} value={department.id}>{content(department.name)}</option>)}
          </Select>
        </FormField>
        <FormField>
          <FormLabel htmlFor="user-manager">{t('admin.manager')}</FormLabel>
          <Select id="user-manager" value={draft.managerId ?? ''} onChange={(event) => onDraftChange({ managerId: event.currentTarget.value || null })}>
            <option value="">{t('admin.noDirectManager')}</option>
            {users.filter((user) => user.id !== editingUserId && user.isActive).map((user) => <option key={user.id} value={user.id}><bdi>{user.fullName}</bdi></option>)}
          </Select>
        </FormField>
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">{t('admin.roles')}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((role) => {
            const isCeoRole = role.id === roleIds.ceo
            const canAssignCeoRole = editingUserId === companyOwnerId
            if (isCeoRole && !canAssignCeoRole) return null
            return (
            <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox checked={draft.roleIds.includes(role.id)} onChange={() => onToggleRole(role.id)} />
              {content(role.name)}
            </label>
            )
          })}
        </div>
      </fieldset>
      {isEditing ? (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox checked={draft.isActive} onChange={(event) => onDraftChange({ isActive: event.currentTarget.checked })} />
          {t('admin.activeAccount')}
        </label>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>{t('requests.cancel')}</Button>
        <Button type="submit">{isEditing ? t('admin.saveChanges') : t('admin.createUser')}</Button>
      </div>
    </form>
  )
}
