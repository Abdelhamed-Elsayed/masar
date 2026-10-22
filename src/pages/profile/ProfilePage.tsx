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
  GraduationCap,
  Award,
  Sparkles,
  BookOpen,
  Edit3,
} from 'lucide-react'
import { Alert, Avatar, Badge, Button, Card, Checkbox, Modal } from '@/components/ui'
import { PageContainer, PageHeader } from '@/components/layout'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { downloadMasarBackup, importMasarBackup, resetMasarData } from '@/utils/localData'
import { useTranslation } from '@/localization/useTranslation'
import { getLocalizedProfile, withLocalizedFields } from '@/utils/localizedProfile'

export function ProfilePage() {
  const { t, content, locale } = useTranslation()
  const currentUser = useAuthStore((state) => state.currentUser)
  const roles = useAuthStore((state) => state.roles)
  const departments = useDirectoryStore((state) => state.departments)
  const users = useDirectoryStore((state) => state.users)
  const setPublicProfileVisibility = useDirectoryStore((state) => state.setPublicProfileVisibility)
  const [dataActionError, setDataActionError] = useState('')
  const [visibilityError, setVisibilityError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const updateUserProfile = useDirectoryStore((state) => state.updateUserProfile)
  const companyOwnerId = useDirectoryStore((state) => state.companyOwnerId)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [skillsInput, setSkillsInput] = useState('')

  if (!currentUser) {
    return null
  }

  const isAdmin = currentUser.roleIds.includes('role-admin') || currentUser.roleIds.includes('role-ceo') || currentUser.id === companyOwnerId

  const department = departments.find((item) => item.id === currentUser.departmentId)
  const manager = users.find((item) => item.id === currentUser.managerId)
  const directoryUser = users.find((item) => item.id === currentUser.id)
  const shownProfile = getLocalizedProfile(directoryUser?.profile, locale)
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

  function handleOpenEditProfile() {
    setBioInput(shownProfile.bio)
    setSkillsInput(shownProfile.skills.join(', '))
    setIsEditingProfile(true)
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    const updatedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const newProfile = withLocalizedFields(directoryUser?.profile, locale, { bio: bioInput.trim(), skills: updatedSkills })
    const success = updateUserProfile(currentUser.id, currentUser.id, newProfile)
    if (success) {
      setProfileSuccess(t('profile.profileSaved'))
      setIsEditingProfile(false)
      setTimeout(() => setProfileSuccess(''), 4000)
    }
  }

  const details = [
    { label: t('profile.fullName'), value: content(currentUser.fullName), icon: UserRound, dir: 'auto' as const },
    { label: t('profile.workEmail'), value: currentUser.email, icon: Mail, dir: 'ltr' as const },
    { label: t('profile.employeeId'), value: currentUser.employeeId, icon: IdCard, dir: 'ltr' as const },
    { label: t('profile.jobTitle'), value: currentUser.jobTitle, icon: BriefcaseBusiness, dir: 'auto' as const },
    { label: t('profile.department'), value: content(department?.name ?? t('profile.notAssigned')), icon: Building2, dir: 'auto' as const },
    { label: t('profile.manager'), value: manager ? content(manager.fullName) : t('profile.notAssigned'), icon: UserRound, dir: 'auto' as const },
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
              name={content(currentUser.fullName)}
              src={currentUser.avatarUrl ?? undefined}
              size="lg"
              className="size-16 shrink-0 text-xl ring-4 ring-blue-50"
            />
            <div className="min-w-0">
              <h2 dir="auto" className="truncate text-xl font-semibold tracking-tight text-slate-900">
                {content(currentUser.fullName)}
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

      <Card as="section" aria-labelledby="profile-public-heading" className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <UserRound size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="profile-public-heading" className="text-base font-semibold text-slate-900">{t('profile.publicProfile')}</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">{t('profile.publicProfileDescription')}</p>
          </div>
        </div>
        <label className="mt-5 flex items-start gap-3 border-t border-slate-100 pt-4 text-sm text-slate-700">
          <Checkbox
            checked={directoryUser?.publicProfileVisible === true}
            disabled={!currentUser.isActive}
            aria-describedby="profile-public-description"
            onChange={(event) => {
              setVisibilityError('')
              if (!setPublicProfileVisibility(currentUser.id, currentUser.id, event.currentTarget.checked)) {
                setVisibilityError(t('profile.publicProfileUpdateFailed'))
              }
            }}
          />
          <span id="profile-public-description" className="leading-6">{t('profile.publicProfileConsent')}</span>
        </label>
        {visibilityError ? <Alert variant="error" className="mt-3">{visibilityError}</Alert> : null}
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)]">
        <div className="space-y-6">
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

          {/* Extended Professional Profile */}
          <Card as="section" aria-labelledby="profile-professional-heading" className="p-5 sm:p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="profile-professional-heading" className="text-base font-semibold text-slate-900">
                    {t('profile.viewProfile')}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50">
                    {t('profile.registeredViewerNotice')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{t('profile.detailsDescription')}</p>
              </div>
              {isAdmin ? (
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleOpenEditProfile}>
                  <Edit3 size={15} aria-hidden="true" />
                  {t('profile.editProfile')}
                </Button>
              ) : (
                <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200/60">
                  <ShieldCheck size={14} className="text-slate-400" aria-hidden="true" />
                  {t('profile.adminOnlyEditNotice')}
                </span>
              )}
            </div>

            {profileSuccess ? <Alert variant="success">{profileSuccess}</Alert> : null}

            {/* Bio */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Sparkles size={14} className="text-blue-600" aria-hidden="true" />
                {t('profile.bio')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                {shownProfile.bio || t('profile.noBio')}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Award size={14} className="text-blue-600" aria-hidden="true" />
                {t('profile.skills')}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {shownProfile.skills.length > 0 ? (
                  shownProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-lg bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">{t('profile.noSkills')}</p>
                )}
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                <BriefcaseBusiness size={14} className="text-blue-600" aria-hidden="true" />
                {t('profile.experience')}
              </h3>
              {shownProfile.experiences.length > 0 ? (
                <div className="space-y-3">
                  {shownProfile.experiences.map((exp) => (
                    <div key={exp.id} className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 bg-white dark:bg-slate-800/40 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{exp.role}</span>
                        <span className="text-xs font-medium text-slate-500"><bdi dir="ltr">{exp.period}</bdi></span>
                      </div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">{exp.company}</p>
                      {exp.description ? <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-2">{exp.description}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">{t('profile.noExperience')}</p>
              )}
            </div>

            {/* Education & Qualifications */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                <GraduationCap size={14} className="text-blue-600" aria-hidden="true" />
                {t('profile.education')}
              </h3>
              {shownProfile.education.length > 0 ? (
                <div className="space-y-2.5">
                  {shownProfile.education.map((edu) => (
                    <div key={edu.id} className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3.5 bg-white dark:bg-slate-800/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{edu.degree}</span>
                        <span className="text-xs text-slate-500"><bdi dir="ltr">{edu.year}</bdi></span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">{t('profile.noEducation')}</p>
              )}
            </div>

            {/* Certifications & Achievements */}
            <div>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                <BookOpen size={14} className="text-blue-600" aria-hidden="true" />
                {t('profile.certifications')}
              </h3>
              {shownProfile.certifications.length > 0 ? (
                <div className="space-y-2.5">
                  {shownProfile.certifications.map((cert) => (
                    <div key={cert.id} className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3.5 bg-white dark:bg-slate-800/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{cert.title}</span>
                        <span className="text-xs text-slate-500"><bdi dir="ltr">{cert.year}</bdi></span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">{t('profile.noCertifications')}</p>
              )}
            </div>
          </Card>
        </div>

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

      <Modal
        open={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title={t('profile.editProfile')}
        className="max-w-xl"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <p className="rounded-lg border border-blue-200/60 bg-blue-50/70 px-3 py-2 text-xs text-blue-800">{t('profile.editingLanguageNote')}</p>
          <div>
            <label htmlFor="profile-bio-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('profile.bio')}
            </label>
            <textarea
              id="profile-bio-input"
              rows={4}
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="اكتب نبذة تعريفية مهنية مختصرة..."
            />
          </div>

          <div>
            <label htmlFor="profile-skills-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('profile.skills')}
            </label>
            <input
              id="profile-skills-input"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="TypeScript, React, Cloud, ..."
            />
            <p className="mt-1 text-xs text-slate-500">افصل بين المهارات بفاصلة (,)</p>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
              {t('requests.cancel')}
            </Button>
            <Button type="submit">
              {t('profile.saveProfile')}
            </Button>
          </div>
        </form>
      </Modal>

    </PageContainer>
  )
}
