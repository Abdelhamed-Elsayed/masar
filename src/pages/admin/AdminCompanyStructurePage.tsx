import { useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, Crown, GitBranch, MoveRight, UsersRound } from 'lucide-react'
import { Button, Card, Modal, Select, Badge } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useDirectoryStore } from '@/store/directoryStore'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'

function descendants(users: User[], userId: string): Set<string> {
  const result = new Set<string>()
  const walk = (parentId: string) => {
    users.filter((user) => user.managerId === parentId).forEach((user) => {
      if (!result.has(user.id)) {
        result.add(user.id)
        walk(user.id)
      }
    })
  }
  walk(userId)
  return result
}

export function AdminCompanyStructurePage() {
  const { t, content, locale } = useTranslation()
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const companyOwnerId = useDirectoryStore((state) => state.companyOwnerId)
  const upsertUser = useDirectoryStore((state) => state.upsertUser)
  const [moving, setMoving] = useState<User | null>(null)
  const [departmentId, setDepartmentId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [error, setError] = useState('')

  const owner = users.find((user) => user.id === companyOwnerId)
  const topLevel = useMemo(() => users.filter((user) => user.managerId === null), [users])

  function openMove(user: User) {
    setMoving(user)
    setDepartmentId(user.departmentId)
    setManagerId(user.managerId ?? '')
    setError('')
  }

  function saveMove() {
    if (!moving) return
    if (moving.id === companyOwnerId) {
      setError(t('admin.ownerTopLevel'))
      return
    }
    if (managerId === moving.id || descendants(users, moving.id).has(managerId)) {
      setError(t('admin.invalidReportingCycle'))
      return
    }
    upsertUser({ ...moving, departmentId, managerId: managerId || null })
    setMoving(null)
  }

  function renderTree(user: User, depth = 0): React.ReactNode {
    const children = users.filter((candidate) => candidate.managerId === user.id)
    const isOwner = user.id === companyOwnerId
    const roleNames = user.roleIds.map((id) => roles.find((role) => role.id === id)?.name).filter((name): name is string => Boolean(name)).slice(0, 2)
    return (
      <div key={user.id} className={depth ? 'max-w-full border-s border-slate-200' : ''} style={depth ? { marginInlineStart: `${Math.min(depth, 4) * 0.5}rem`, paddingInlineStart: `${Math.min(depth, 4) * 0.5}rem` } : undefined}>
        <article className={`group flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${isOwner ? 'border-amber-300 bg-gradient-to-r from-slate-950 to-slate-900 text-white shadow-md' : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-sm'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isOwner ? 'bg-amber-400 text-slate-950' : 'bg-teal-50 text-teal-700'}`}>
              {isOwner ? <Crown size={20} aria-hidden="true" /> : <UsersRound size={20} aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`truncate text-sm font-bold ${isOwner ? 'text-white' : 'text-slate-900'}`}>{content(user.fullName)}</h2>
                {isOwner ? <Badge variant="warning">{t('admin.ceoOwner')}</Badge> : null}
              </div>
              <p className={`mt-0.5 text-xs ${isOwner ? 'text-slate-300' : 'text-slate-500'}`}>{content(user.jobTitle)}</p>
              <div className="mt-2 flex flex-wrap gap-1">{roleNames.map((name) => <Badge key={name}>{content(name)}</Badge>)}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className={`hidden text-end text-xs sm:block ${isOwner ? 'text-slate-300' : 'text-slate-500'}`}>
              <div>{content(departments.find((department) => department.id === user.departmentId)?.name ?? t('admin.unassigned'))}</div>
              <div className="mt-0.5">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(children.length)} {children.length === 1 ? t('admin.directReport') : t('admin.directReports')}</div>
            </div>
            {!isOwner ? <Button type="button" size="sm" variant="outline" onClick={() => openMove(user)}><MoveRight size={14} aria-hidden="true" />{t('admin.move')}</Button> : null}
          </div>
        </article>
        {children.length ? <div className="mt-3 space-y-3">{children.map((child) => renderTree(child, depth + 1))}</div> : null}
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.companyStructure')}
        description={t('admin.structureDescription')}
        actions={<Button type="button" variant="outline" onClick={() => window.location.reload()}><GitBranch size={16} aria-hidden="true" />{t('admin.refreshStructure')}</Button>}
      />
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.companyOwner')}</p><p className="mt-2 text-lg font-bold text-slate-900">{owner ? content(owner.fullName) : t('admin.unassigned')}</p><p className="mt-1 text-xs text-slate-500">{t('admin.ultimateControl')}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.employees')}</p><p className="mt-2 text-lg font-bold text-slate-900">{users.length}</p><p className="mt-1 text-xs text-slate-500">{t('admin.across')} {departments.length} {t('admin.departments')}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin.reportingRoots')}</p><p className="mt-2 text-lg font-bold text-slate-900">{topLevel.length}</p><p className="mt-1 text-xs text-slate-500">{t('admin.onlyRoot')}</p></Card>
      </section>
      <Card className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><GitBranch size={18} aria-hidden="true" /></span><div><h2 className="font-semibold text-slate-900">{t('admin.organizationTree')}</h2><p className="mt-1 text-sm text-slate-500">{t('admin.structureContext')}</p></div></div>
        <div className="space-y-3">{topLevel.map((user) => renderTree(user))}</div>
        {topLevel.length > 1 ? <p className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><ArrowDown size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{t('admin.multipleRoots')}</p> : null}
      </Card>
      <Modal open={Boolean(moving)} onClose={() => setMoving(null)} title={`${t('admin.moveEmployee')}: ${moving ? content(moving.fullName) : t('admin.employees')}`} description={t('admin.moveDescription')}>
        {moving ? <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold text-slate-900">{t('admin.currentPosition')}</p><p className="mt-1 text-slate-600">{content(moving.jobTitle)} · {content(departments.find((department) => department.id === moving.departmentId)?.name ?? t('admin.unassigned'))}</p></div>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.department')}</span><Select value={departmentId} onChange={(event) => setDepartmentId(event.currentTarget.value)}><option value="">{t('admin.chooseDepartment')}</option>{departments.map((department) => <option key={department.id} value={department.id}>{content(department.name)}</option>)}</Select></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{t('admin.manager')}</span><Select value={managerId} onChange={(event) => setManagerId(event.currentTarget.value)}><option value="">{t('admin.noManager')}</option>{users.filter((candidate) => candidate.id !== moving.id && candidate.isActive).map((candidate) => <option key={candidate.id} value={candidate.id}>{content(candidate.fullName)} · {content(candidate.jobTitle)}</option>)}</Select></label>
          {error ? <p role="alert" className="text-sm font-medium text-rose-700">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setMoving(null)}>{t('requests.cancel')}</Button><Button type="button" onClick={saveMove}><ArrowRight size={15} aria-hidden="true" />{t('admin.confirmMove')}</Button></div>
        </div> : null}
      </Modal>
    </PageContainer>
  )
}
