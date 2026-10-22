import { useMemo, useState } from 'react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Alert, Button, Card, Input, Select } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { roleIds } from '@/mock/users'
import type { User } from '@/types/user'
import { useTranslation } from '@/localization/useTranslation'
import type { TranslationKey } from '@/localization/translations'

function stageLabel(stage: User['registrationStage'], t: (key: TranslationKey) => string) {
  switch (stage) {
    case 'HR_REVIEW': return t('registration.hrReview')
    case 'DEPARTMENT_HEAD_REVIEW': return t('registration.departmentHeadReview')
    case 'CEO_REVIEW': return t('registration.ceoAssignment')
    case 'APPROVED': return t('registration.approved')
    case 'REJECTED': return t('registration.rejected')
    default: return t('registration.unknownStage')
  }
}

export function RegistrationApprovalsPage() {
  const { t, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const roles = useDirectoryStore((state) => state.roles)
  const approveHr = useDirectoryStore((state) => state.approveRegistrationByHr)
  const rejectHr = useDirectoryStore((state) => state.rejectRegistrationByHr)
  const approveHead = useDirectoryStore((state) => state.approveRegistrationByDepartmentHead)
  const rejectHead = useDirectoryStore((state) => state.rejectRegistrationByDepartmentHead)
  const finalizeCeo = useDirectoryStore((state) => state.finalizeRegistrationByCeo)
  const rejectCeo = useDirectoryStore((state) => state.rejectRegistrationByCeo)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [managerId, setManagerId] = useState<string>('')
  const [roleSelection, setRoleSelection] = useState<string>(roleIds.employee)

  const actorId = currentUser?.id ?? ''
  const isCeo = currentUser ? useDirectoryStore.getState().companyOwnerId === currentUser.id : false
  const isHr = currentUser?.roleIds.includes(roleIds.hr) ?? false
  const assignedHeadDepartments = useMemo(() => departments.filter((department) => department.headUserId === actorId), [departments, actorId])
  const pending = users.filter((user) => ['HR_REVIEW', 'DEPARTMENT_HEAD_REVIEW', 'CEO_REVIEW'].includes(user.registrationStage ?? ''))

  const visible = pending.filter((user) => {
    if (isCeo) return user.registrationStage === 'CEO_REVIEW'
    return (isHr && user.registrationStage === 'HR_REVIEW')
      || (user.registrationStage === 'DEPARTMENT_HEAD_REVIEW' && assignedHeadDepartments.some((department) => department.id === user.departmentId))
  })

  const selected = selectedId ? users.find((user) => user.id === selectedId) ?? null : null

  function selectUser(user: User) {
    setSelectedId(user.id)
    setError('')
    setNote('')
    setJobTitle(user.jobTitle)
    setDepartmentId(user.departmentId)
    setManagerId(user.managerId ?? '')
    setRoleSelection(user.roleIds.find((id) => id !== roleIds.employee) ?? roleIds.employee)
  }

  function review(action: 'approve' | 'reject') {
    if (!selected) return
    const ok = selected.registrationStage === 'HR_REVIEW'
      ? action === 'approve' ? approveHr(selected.id, actorId, note) : rejectHr(selected.id, actorId, note)
      : action === 'approve' ? approveHead(selected.id, actorId, note) : rejectHead(selected.id, actorId, note)
    if (!ok) setError(t('registration.invalidAction'))
    else setSelectedId(null)
  }

  function finalize() {
    if (!selected) return
    const ok = finalizeCeo(selected.id, actorId, { jobTitle, departmentId, managerId: managerId || null, roleIds: Array.from(new Set([roleIds.employee, roleSelection])), note })
    if (!ok) setError(t('registration.finalizeFailed'))
    else setSelectedId(null)
  }

  return (
    <PageContainer>
      <PageHeader title={t('registration.title')} description={t('registration.description')} />
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('registration.queue')}</p><h2 className="mt-1 text-lg font-semibold">{t('registration.pending')}</h2></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{visible.length}</span></div>
          <div className="space-y-2">
            {visible.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">{t('registration.empty')}</p> : visible.map((user) => (
              <button key={user.id} type="button" onClick={() => selectUser(user)} className={`w-full rounded-xl border p-4 text-start transition ${selected?.id === user.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-slate-900">{content(user.fullName)}</p><p className="mt-1 break-all text-xs text-slate-500">{user.email}</p></div><span className="max-w-36 shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">{stageLabel(user.registrationStage, t)}</span></div>
                <p className="mt-2 text-xs text-slate-500">{content(departments.find((d) => d.id === user.departmentId)?.name ?? t('registration.noDepartment'))} · {content(user.jobTitle)}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          {!selected ? <div className="grid min-h-80 place-items-center text-center"><div><h2 className="text-lg font-semibold text-slate-900">{t('registration.select')}</h2><p className="mt-2 max-w-md text-sm text-slate-500">{t('registration.selectDescription')}</p></div></div> : (
            <div className="space-y-5">
              <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">{stageLabel(selected.registrationStage, t)}</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">{content(selected.fullName)}</h2><p className="mt-1 break-all text-sm text-slate-500">{selected.email} · {selected.employeeId}</p></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('registration.requestedDepartment')}</p><p className="mt-1 text-sm font-semibold">{content(departments.find((d) => d.id === selected.departmentId)?.name ?? t('registration.unknownDepartment'))}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{t('registration.requestedJobTitle')}</p><p className="mt-1 text-sm font-semibold">{content(selected.jobTitle)}</p></div></div>
              {selected.registrationStage === 'CEO_REVIEW' && isCeo ? (
                <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4"><div><p className="text-sm font-semibold">{t('registration.assignPosition')}</p><p className="mt-1 text-xs text-slate-500">{t('registration.assignDescription')}</p></div>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">{t('registration.jobTitle')}<Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="mt-1" /></label><label className="text-sm font-medium">{t('registration.department')}<Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="mt-1">{departments.map((d) => <option key={d.id} value={d.id}>{content(d.name)}</option>)}</Select></label><label className="text-sm font-medium">{t('registration.directManager')}<Select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="mt-1"><option value="">{t('registration.noManager')}</option>{users.filter((u) => u.isActive && u.id !== selected.id).map((u) => <option key={u.id} value={u.id}>{content(u.fullName)}</option>)}</Select></label><label className="text-sm font-medium">{t('registration.finalRole')}<Select value={roleSelection} onChange={(e) => setRoleSelection(e.target.value)} className="mt-1">{roles.filter((r) => r.id !== roleIds.ceo && r.id !== roleIds.admin).map((r) => <option key={r.id} value={r.id}>{content(r.name)}</option>)}</Select></label></div>
                  <label className="block text-sm font-medium">{t('registration.ceoNote')}<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('registration.optional')} className="mt-1" /></label>
                  <div className="flex flex-wrap gap-2"><Button type="button" onClick={finalize}>{t('registration.approveAssign')}</Button><Button type="button" variant="secondary" onClick={() => { if (!note.trim()) { setError(t('registration.rejectReasonRequired')); return } const ok = rejectCeo(selected.id, actorId, note); if (!ok) setError(t('registration.rejectFailed')); else setSelectedId(null) }}>{t('registration.reject')}</Button></div>
                </div>
              ) : (
                <div className="space-y-4"><label className="block text-sm font-medium">{t('registration.reviewNote')}{selected.registrationStage !== 'CEO_REVIEW' ? ` (${t('registration.rejectionRequired')})` : ''}<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('registration.decisionNote')} className="mt-1" /></label><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => review('approve')}>{t('registration.approve')}</Button><Button type="button" variant="secondary" onClick={() => { if (!note.trim()) { setError(t('registration.rejectReasonRequired')); return } review('reject') }}>{t('registration.reject')}</Button></div></div>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}
