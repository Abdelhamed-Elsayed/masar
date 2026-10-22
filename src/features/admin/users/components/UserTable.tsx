import { Badge, Button } from '@/components/ui'
import {
  DataTable,
  TableCell,
  TableEmptyState,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@/components/tables'
import type { Department } from '@/types/department'
import type { Role } from '@/types/auth'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'

interface UserTableProps {
  users: User[]
  departments: Department[]
  roles: Role[]
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onApprove: (user: User) => void
  onMakeCeo: (user: User) => void
  onPromote?: (user: User) => void
  isCeo?: boolean
  companyOwnerId: string
}

export function UserTable({
  users,
  departments,
  roles,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onMakeCeo,
  onPromote,
  isCeo,
  companyOwnerId,
}: UserTableProps) {
  const { t, content } = useTranslation()
  const registrationStageLabel = (stage: User['registrationStage']) => stage === 'HR_REVIEW'
    ? t('registration.hrReview')
    : stage === 'DEPARTMENT_HEAD_REVIEW'
      ? t('registration.departmentHeadReview')
      : t('registration.ceoAssignment')
  const statusLabel = (user: User) => user.approvalStatus === 'PENDING'
    ? t('admin.pendingApproval')
    : user.isActive
      ? t('admin.active')
      : t('admin.inactive')
  return (
    <>
      <div className="grid gap-3 lg:hidden" aria-label={t('admin.users')}>
        {users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-medium text-slate-800">{t('admin.noUsers')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('admin.adjustUserFilters')}</p>
          </div>
        ) : users.map((user) => (
          <article key={user.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-slate-900">{content(user.fullName)}</h2>
                <p className="mt-1 break-all text-xs text-slate-600">{user.email}</p>
              </div>
              <Badge variant={user.approvalStatus === 'PENDING' ? 'warning' : user.isActive ? 'success' : 'default'}>{statusLabel(user)}</Badge>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">{t('admin.employeeId')}</dt>
                <dd className="mt-0.5 font-medium text-slate-800"><bdi dir="ltr">{user.employeeId}</bdi></dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">{t('admin.department')}</dt>
                <dd className="mt-0.5 text-slate-800">
                  {content(departments.find((department) => department.id === user.departmentId)?.name ?? t('admin.unassigned'))}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">{t('admin.roles')}</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {user.roleIds.map((id) => (
                    <Badge key={id}>{content(roles.find((role) => role.id === id)?.name ?? id)}</Badge>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-1 border-t border-slate-100 pt-3 sm:flex sm:flex-wrap">
              {user.approvalStatus === 'PENDING' && !user.registrationStage ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => onApprove(user)}>
                  {t('admin.approve')}
                </Button>
              ) : null}
              {user.registrationStage && user.registrationStage !== 'APPROVED' && user.registrationStage !== 'REJECTED' ? <Badge variant="warning" className="col-span-2 justify-center sm:col-span-1">{registrationStageLabel(user.registrationStage)}</Badge> : null}
              {isCeo && onPromote && user.id !== companyOwnerId ? (
                <Button type="button" variant="secondary" size="sm" className="text-blue-700 bg-blue-50 hover:bg-blue-100" onClick={() => onPromote(user)}>
                  {t('admin.promote')}
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" onClick={() => onView(user)}>{t('admin.view')}</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(user)}>{t('admin.moveEdit')}</Button>
              {user.id !== companyOwnerId ? <Button type="button" variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50" onClick={() => onMakeCeo(user)}>{t('admin.makeCeo')}</Button> : <span className="inline-flex items-center justify-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">CEO</span>}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-700 hover:bg-red-50"
                onClick={() => onDelete(user)}
              >
                {t('admin.delete')}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden lg:block">
        <DataTable caption={t('admin.users')}>
          <TableHeader>
            <TableRow>
              <TableHeadCell className="text-start">{t('admin.name')}</TableHeadCell>
              <TableHeadCell className="text-start">{t('admin.employeeId')}</TableHeadCell>
              <TableHeadCell className="text-start">{t('admin.department')}</TableHeadCell>
              <TableHeadCell className="text-start">{t('admin.roles')}</TableHeadCell>
              <TableHeadCell className="text-start">{t('admin.status')}</TableHeadCell>
              <TableHeadCell className="text-end"><span className="sr-only">{t('admin.actions')}</span></TableHeadCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {users.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                title={t('admin.noUsers')}
                description={t('admin.adjustUserFilters')}
              />
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-start">
                    <div className="font-medium text-slate-900">{content(user.fullName)}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-start">
                    <bdi dir="ltr">{user.employeeId}</bdi>
                  </TableCell>
                  <TableCell className="text-start">
                    {content(departments.find((department) => department.id === user.departmentId)?.name ?? t('admin.unassigned'))}
                  </TableCell>
                  <TableCell className="text-start">
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {user.roleIds.map((id) => (
                        <Badge key={id}>{content(roles.find((role) => role.id === id)?.name ?? id)}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-start">
                    <Badge variant={user.approvalStatus === 'PENDING' ? 'warning' : user.isActive ? 'success' : 'default'}>
                      {statusLabel(user)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {user.approvalStatus === 'PENDING' && !user.registrationStage ? (
                        <Button type="button" variant="secondary" size="sm" onClick={() => onApprove(user)}>
                          {t('admin.approve')}
                        </Button>
                      ) : null}
                      {user.registrationStage && user.registrationStage !== 'APPROVED' && user.registrationStage !== 'REJECTED' ? <Badge variant="warning">{registrationStageLabel(user.registrationStage)}</Badge> : null}
                      {isCeo && onPromote && user.id !== companyOwnerId ? (
                        <Button type="button" variant="secondary" size="sm" className="text-blue-700 bg-blue-50 hover:bg-blue-100" onClick={() => onPromote(user)}>
                          {t('admin.promote')}
                        </Button>
                      ) : null}
                      <Button type="button" variant="ghost" size="sm" onClick={() => onView(user)}>{t('admin.view')}</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(user)}>{t('admin.moveEdit')}</Button>
                      {user.id !== companyOwnerId ? <Button type="button" variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-50" onClick={() => onMakeCeo(user)}>{t('admin.makeCeo')}</Button> : <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">CEO</span>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(user)}
                      >
                        {t('admin.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </DataTable>
      </div>
    </>
  )
}
