import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Modal } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/user'
import { roleIds } from '@/mock/users'
import { DeleteUserConfirmation } from './DeleteUserConfirmation'
import { UserDetails } from './UserDetails'
import { UserFilters } from './UserFilters'
import { UserForm } from './UserForm'
import type { UserDraft } from './UserForm'
import { UserTable } from './UserTable'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

type DialogMode = 'create' | 'edit' | 'view' | 'delete'
type UserStatusFilter = 'all' | 'active' | 'inactive'

interface UserDialog {
  mode: DialogMode
  user?: User
}

const emptyDraft: UserDraft = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  jobTitle: '',
  departmentId: '',
  managerId: null,
  roleIds: [],
  isActive: true,
  password: '',
}

function draftFromUser(user: User): UserDraft {
  const { id: _id, fullName: _fullName, avatarUrl: _avatarUrl, ...draft } = user
  return { ...draft, roleIds: [...draft.roleIds], password: '' }
}

function titleForDialog(dialog: UserDialog | null, t: (key: TranslationKey) => string): string {
  switch (dialog?.mode) {
    case 'create':
      return t('admin.addUserTitle')
    case 'edit':
      return t('admin.editUserTitle')
    case 'view':
      return t('admin.userDetails')
    case 'delete':
      return t('admin.deleteUser')
    default:
      return ''
  }
}

export function AdminUsersManager() {
  const { t } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const upsertUser = useDirectoryStore((state) => state.upsertUser)
  const companyOwnerId = useDirectoryStore((state) => state.companyOwnerId)
  const setCompanyOwner = useDirectoryStore((state) => state.setCompanyOwner)
  const removeUser = useDirectoryStore((state) => state.removeUser)
  const setPassword = useAuthStore((state) => state.setPassword)
  const removePassword = useAuthStore((state) => state.removePassword)
  const currentUser = useAuthStore((state) => state.currentUser)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all')
  const [dialog, setDialog] = useState<UserDialog | null>(null)
  const [draft, setDraft] = useState<UserDraft>(emptyDraft)
  const [error, setError] = useState('')
  const [approvalError, setApprovalError] = useState('')

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        [user.fullName, user.email, user.employeeId, user.jobTitle].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? user.isActive : !user.isActive)
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, users])

  function openForm(mode: 'create' | 'edit', user?: User) {
    setDraft(user ? draftFromUser(user) : { ...emptyDraft })
    setError('')
    setDialog({ mode, user })
  }

  function changeDraft(updates: Partial<UserDraft>) {
    setDraft((current) => ({ ...current, ...updates }))
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = draft.email.trim().toLowerCase()
    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.id !== dialog?.user?.id,
    )
    if (duplicateEmail) {
      setError(t('admin.userExists'))
      return
    }

    const firstName = draft.firstName.trim()
    const lastName = draft.lastName.trim()
    if (!isEditing && draft.password.trim().length < 8) {
      setError(t('admin.passwordMin'))
      return
    }

    const userId = dialog?.user?.id ?? `user-${crypto.randomUUID()}`
    const isCompanyOwner = userId === companyOwnerId
    const protectedRoleIds = isCompanyOwner
      ? (draft.roleIds.includes(roleIds.ceo) ? draft.roleIds : [...draft.roleIds, roleIds.ceo])
      : draft.roleIds.filter((id) => id !== roleIds.ceo)
    const { password: draftPassword, ...userDraft } = draft
    const isRejectedRegistration = dialog?.user?.registrationStage === 'REJECTED'
    const existingRegistration = dialog?.user?.registrationStage && !['APPROVED', 'REJECTED'].includes(dialog.user.registrationStage)
    upsertUser({
      ...userDraft,
      roleIds: protectedRoleIds,
      id: userId,
      fullName: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: draft.email.trim(),
      employeeId: draft.employeeId.trim(),
      jobTitle: isCompanyOwner ? 'CEO & Company Owner' : draft.jobTitle.trim(),
      avatarUrl: dialog?.user?.avatarUrl ?? null,
      isActive: isRejectedRegistration || existingRegistration ? false : draft.isActive,
      approvalStatus: isRejectedRegistration ? 'REJECTED' : existingRegistration ? 'PENDING' : (draft.isActive ? 'APPROVED' : draft.approvalStatus),
      registrationStage: isRejectedRegistration ? 'REJECTED' : existingRegistration ? dialog?.user?.registrationStage : (dialog?.user?.registrationStage ?? (draft.isActive ? 'APPROVED' : undefined)),
      registrationSubmittedAt: dialog?.user?.registrationSubmittedAt,
      registrationDecisionNote: dialog?.user?.registrationDecisionNote,
    })
    if (draftPassword.trim()) await setPassword(userId, draftPassword.trim())
    setDialog(null)
  }

  function approveUser(user: User) {
    if (user.registrationStage === 'REJECTED' || user.approvalStatus === 'REJECTED') {
      setApprovalError(t('admin.rejectedCannotActivate'))
      return
    }
    upsertUser({ ...user, isActive: true, approvalStatus: 'APPROVED' })
    setApprovalError('')
  }

  function makeCeo(user: User) {
    if (!currentUser || !useDirectoryStore.getState().hasPermission(currentUser.id, 'company.manage')) {
      setApprovalError(t('admin.onlyCeoTransfer'))
      return
    }
    setCompanyOwner(user.id)
    setApprovalError(`${user.fullName} ${t('admin.ceoTransferred')}`)
  }

  function deleteUser() {
    if (dialog?.mode === 'delete' && dialog.user) {
      removeUser(dialog.user.id)
      removePassword(dialog.user.id)
    }
    setDialog(null)
  }

  function toggleRole(roleId: string) {
    setDraft((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId],
    }))
  }

  const isEditing = dialog?.mode === 'edit'

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.users')}
        description={t('admin.usersDescription')}
        actions={
          <Button type="button" onClick={() => openForm('create')}>
            {t('admin.addUser')}
          </Button>
        }
      />
      <section className="space-y-4" aria-label={t('admin.userManagement')}>
        {approvalError ? <p role="alert" className="text-sm text-rose-700">{approvalError}</p> : null}
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-slate-950 via-slate-900 to-[#1f2937] p-5 text-white shadow-sm" aria-label={t('admin.companyControl')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">{t('admin.companyControl')}</p>
              <h2 className="mt-1 text-lg font-semibold">{t('admin.ceoOwner')}</h2>
              <p className="mt-1 text-sm text-slate-300"><bdi>{users.find((user) => user.id === companyOwnerId)?.fullName ?? t('admin.notAssigned')}</bdi> {t('admin.ceoControlDescription')}</p>
            </div>
            {currentUser?.id === companyOwnerId ? <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200">{t('admin.youAreCeo')}</span> : null}
          </div>
        </section>
        <UserFilters
          query={query}
          activeFilter={statusFilter}
          onQueryChange={setQuery}
          onActiveFilterChange={setStatusFilter}
        />
        <UserTable
          users={filteredUsers}
          departments={departments}
          roles={roles}
          onView={(user) => setDialog({ mode: 'view', user })}
          onEdit={(user) => openForm('edit', user)}
          onDelete={(user) => setDialog({ mode: 'delete', user })}
          onApprove={approveUser}
          onMakeCeo={makeCeo}
          companyOwnerId={companyOwnerId}
        />
      </section>

      <Modal
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        title={titleForDialog(dialog, t)}
        description={
          dialog?.mode === 'delete'
            ? t('admin.deleteUserLocal')
            : undefined
        }
        className="max-w-2xl"
      >
        {dialog?.mode === 'view' && dialog.user ? (
          <UserDetails
            user={dialog.user}
            users={users}
            departments={departments}
            roles={roles}
            onClose={() => setDialog(null)}
          />
        ) : dialog?.mode === 'delete' && dialog.user ? (
          <DeleteUserConfirmation
            user={dialog.user}
            onCancel={() => setDialog(null)}
            onConfirm={deleteUser}
          />
        ) : dialog?.mode === 'create' || dialog?.mode === 'edit' ? (
          <UserForm
            draft={draft}
            departments={departments}
            roles={roles}
            users={users}
            editingUserId={dialog.user?.id}
            companyOwnerId={companyOwnerId}
            error={error}
            isEditing={isEditing}
            onDraftChange={changeDraft}
            onToggleRole={toggleRole}
            onSubmit={saveUser}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>
    </PageContainer>
  )
}
