import { useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  IdCard,
  Mail,
  ShieldCheck,
  UserRound,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react'
import { Alert, Avatar, Badge, Card } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { downloadMasarBackup, importMasarBackup, resetMasarData } from '@/utils/localData'
import { useTranslation } from '@/localization/useTranslation'

export function ProfilePage() {
  const { t, content } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const roles = useAuthStore((state) => state.roles)
  const departments = useDirectoryStore((state) => state.departments)
  const users = useDirectoryStore((state) => state.users)
  const [dataActionError, setDataActionError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  if (!currentUser) {
    return null
  }

  const department = departments.find((item) => item.id === currentUser.departmentId)
  const manager = users.find((item) => item.id === currentUser.managerId)
  const approvalStatus = currentUser.approvalStatus
  const accountStatus = !currentUser.isActive
    ? { label: t('profile.inactive'), variant: 'danger' as const }
    : approvalStatus === 'PENDING'
      ? { label: t('profile.pending'), variant: 'warning' as const }
      : { label: t('profile.active'), variant: 'success' as const }


  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setDataActionError('')
    setIsImporting(true)
    try {
      await importMasarBackup(file)
      window.location.reload()
    } catch (importError) {
      console.error('Masar backup import failed', importError)
      setDataActionError(t('profile.importFailed'))
    } finally {
      setIsImporting(false)
    }
  }

  async function handleReset() {
    if (!window.confirm(t('profile.resetConfirm'))) return
    setDataActionError('')
    setIsResetting(true)
    try {
      await resetMasarData()
      window.location.reload()
    } catch (resetError) {
      console.error('Masar data reset failed', resetError)
      setDataActionError(t('profile.resetFailed'))
    } finally {
      setIsResetting(false)
    }
  }

  async function handleExport() {
    setDataActionError('')
    setIsExporting(true)
    try {
      await downloadMasarBackup()
    } catch (exportError) {
      console.error('Masar backup export failed', exportError)
      setDataActionError(t('profile.exportFailed'))
    } finally {
      setIsExporting(false)
    }
  }

  const details = [
    { label: t('profile.fullName'), value: currentUser.fullName, icon: UserRound, dir: 'auto' as const },
    { label: t('profile.workEmail'), value: currentUser.email, icon: Mail, dir: 'ltr' as const },
    { label: t('profile.employeeId'), value: currentUser.employeeId, icon: IdCard, dir: 'ltr' as const },
    { label: t('profile.jobTitle'), value: currentUser.jobTitle, icon: BriefcaseBusiness, dir: 'auto' as const },
    { label: t('profile.department'), value: content(department?.name ?? t('profile.notAssigned')), icon: Building2, dir: 'auto' as const },
    { label: t('profile.manager'), value: manager?.fullName ?? t('profile.notAssigned'), icon: UserRound, dir: 'auto' as const },
  ]

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={t('profile.title')}
        description={t('profile.description')}
      />

      <Card as="section" aria-label={t('profile.overview')} className="overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-800 via-blue-600 to-emerald-500 rtl:bg-gradient-to-l" />
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              name={currentUser.fullName}
              src={currentUser.avatarUrl ?? undefined}
              size="lg"
              className="size-16 shrink-0 text-xl ring-4 ring-blue-50"
            />
            <div className="min-w-0">
              <h2 dir="auto" className="truncate text-xl font-semibold tracking-tight text-slate-900">
                {currentUser.fullName}
              </h2>
              <p dir="auto" className="mt-1 text-sm text-slate-600">
                {content(currentUser.jobTitle || t('profile.teamMember'))}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {content(department?.name ?? t('profile.notAssigned'))}
              </p>
            </div>
          </div>
          <Badge variant={accountStatus.variant} className="w-fit gap-1.5 px-3 py-1">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {accountStatus.label}
          </Badge>
        </div>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)]">
        <Card as="section" aria-labelledby="profile-details-heading" className="p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 id="profile-details-heading" className="text-base font-semibold text-slate-900">
              {t('profile.details')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('profile.detailsDescription')}</p>
          </div>
          <dl className="grid gap-x-6 gap-y-5 pt-5 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon, dir }) => (
              <div key={label} className="min-w-0">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </dt>
                <dd dir={dir} className="mt-1.5 break-words text-sm font-medium text-slate-800">
                  {content(value || t('profile.notProvided'))}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-6">
          <Card as="section" aria-labelledby="profile-access-heading" className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <ShieldCheck size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="profile-access-heading" className="text-base font-semibold text-slate-900">
                  {t('profile.access')}
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {t('profile.accessDescription')}
                </p>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">{t('profile.assignedRoles')}</p>
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => <Badge key={role.id} variant="primary">{content(role.name)}</Badge>)}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t('profile.noRoles')}</p>
              )}
            </div>
          </Card>

          <Card as="section" aria-labelledby="profile-data-heading" className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                <Download size={19} aria-hidden="true" />
              </span>
              <div>
                <h2 id="profile-data-heading" className="text-base font-semibold text-slate-900">{t('profile.browserData')}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">{t('profile.browserDataDescription')}</p>
              </div>
            </div>
            {dataActionError ? <Alert variant="error" className="mt-4">{dataActionError}</Alert> : null}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => void handleExport()} disabled={isExporting || isImporting || isResetting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                <Download size={16} aria-hidden="true" /> {t('profile.export')}
              </button>
              <label className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${isExporting || isImporting || isResetting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <Upload size={16} aria-hidden="true" /> {t('profile.import')}
                <input type="file" accept="application/json,.json" className="sr-only" disabled={isExporting || isImporting || isResetting} onChange={handleImport} />
              </label>
              <button type="button" onClick={() => void handleReset()} disabled={isExporting || isImporting || isResetting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
                <RotateCcw size={16} aria-hidden="true" /> {t('profile.reset')}
              </button>
            </div>
          </Card>

          <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
            <p className="text-sm leading-6 text-emerald-900">
              {t('profile.accountNotice')}
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
