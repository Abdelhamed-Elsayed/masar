import { Badge, Checkbox } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { DataTable, TableCell, TableHeader, TableHeadCell, TableRow } from '@/components/tables'
import { useDirectoryStore } from '@/store/directoryStore'
import { useTranslation } from '@/localization/useTranslation'

const permissions = [
  { id: 'requests.create', key: 'admin.createRequests' },
  { id: 'requests.read', key: 'admin.viewRequests' },
  { id: 'requests.approve', key: 'admin.approveAssigned' },
  { id: 'users.manage', key: 'admin.manageUsers' },
  { id: 'settings.manage', key: 'admin.manageSettings' },
  { id: 'company.manage', key: 'admin.controlStructure' },
  { id: 'departments.manage', key: 'admin.manageDepartments' },
  { id: 'roles.manage', key: 'admin.manageRoles' },
  { id: 'workflows.manage', key: 'admin.manageWorkflows' },
  { id: 'audit.read', key: 'admin.viewAudit' },
] as const

export function AdminRolesManager() {
  const { t, content } = useTranslation()
  const roles = useDirectoryStore((state) => state.roles)
  const users = useDirectoryStore((state) => state.users)
  const rolePermissions = useDirectoryStore((state) => state.rolePermissions)
  const setRolePermission = useDirectoryStore((state) => state.setRolePermission)

  return (
    <PageContainer>
      <PageHeader title={t('admin.rolesPermissions')} description={t('admin.rolesDescription')} />
      <div className="space-y-8">
        <section aria-labelledby="roles-list-title" className="space-y-3">
          <h2 id="roles-list-title" className="text-lg font-semibold text-slate-900">{t('admin.roleDirectory')}</h2>
          <DataTable caption={t('admin.availableRoles')}>
            <TableHeader><TableRow><TableHeadCell>{t('admin.role')}</TableHeadCell><TableHeadCell>{t('admin.code')}</TableHeadCell><TableHeadCell>{t('admin.description')}</TableHeadCell><TableHeadCell>{t('admin.users')}</TableHeadCell></TableRow></TableHeader>
            <tbody>{roles.map((role) => {
              const assignedCount = users.filter((user) => user.roleIds.includes(role.id)).length
              return <TableRow key={role.id}>
                <TableCell className="font-medium text-slate-900">{content(role.name)}</TableCell>
                <TableCell><code className="text-xs">{role.code}</code></TableCell>
                <TableCell>{content(role.description)}</TableCell>
                <TableCell><Badge>{assignedCount}</Badge></TableCell>
              </TableRow>
            })}</tbody>
          </DataTable>
        </section>
        <section aria-labelledby="permission-matrix-title" className="space-y-3">
          <div><h2 id="permission-matrix-title" className="text-lg font-semibold text-slate-900">{t('admin.permissionMatrix')}</h2><p className="mt-1 text-sm text-slate-600">{t('admin.permissionMatrixHelp')}</p></div>
          <DataTable caption="Role permission matrix" className="min-w-[56rem]">
            <TableHeader><TableRow><TableHeadCell>{t('admin.permission')}</TableHeadCell>{roles.map((role) => <TableHeadCell key={role.id}>{content(role.name)}</TableHeadCell>)}</TableRow></TableHeader>
            <tbody>{permissions.map((permission) => {
              return <TableRow key={permission.id}>
                <TableCell className="font-medium text-slate-800">{t(permission.key)}</TableCell>
                {roles.map((role) => {
                  const checked = (rolePermissions[role.id] ?? []).includes(permission.id)
                  const isProtectedCeoPermission = role.code === 'CEO' && [
                    'company.manage',
                    'users.manage',
                    'users.registration.review',
                    'departments.manage',
                    'roles.manage',
                    'workflows.manage',
                    'settings.manage',
                    'audit.read',
                  ].includes(permission.id)
                  return <TableCell key={role.id}><label className="inline-flex min-h-8 items-center justify-center gap-2"><Checkbox aria-label={`${t(permission.key)} ${t('admin.permissionForRole')} ${content(role.name)}`} checked={checked} disabled={isProtectedCeoPermission} onChange={() => setRolePermission(role.id, permission.id, !checked)} /><span className="sr-only">{checked ? t('admin.allowed') : t('admin.notAllowed')}</span></label></TableCell>
                })}
              </TableRow>
            })}</tbody>
          </DataTable>
        </section>
      </div>
    </PageContainer>
  )
}
