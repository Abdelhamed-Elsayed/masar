import { useMemo, useState } from 'react'
import { getLocalizedProfile } from '@/utils/localizedProfile'
import { EmployeeProfileModal } from './company/EmployeeProfileModal'
import type { LandingEmployee } from './company/EmployeeProfileModal'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Blocks,
  Check,
  CircleUserRound,
  FolderKanban,
  GitBranch,
  LockKeyhole,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { Link } from 'react-router'
import { Avatar, Spinner } from '@/components/ui'
import { Reveal } from '@/components/motion/Reveal'
import { NetworkBackground } from '@/components/motion/NetworkBackground'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'
import { useAuthStore } from '@/store/authStore'
import { useDirectoryStore } from '@/store/directoryStore'
import { roleIds } from '@/mock/users'
import type { User } from '@/types/user'

const capabilityCards = [
  { icon: Workflow, title: 'company.workflowTitle', description: 'company.workflowDescription' },
  { icon: Blocks, title: 'company.teamworkTitle', description: 'company.teamworkDescription' },
  { icon: LockKeyhole, title: 'company.trustTitle', description: 'company.trustDescription' },
] as const

const jobTitleCodes: Record<string, string> = {
  'CEO & Company Owner': 'CEO',
  'Chief Technology Officer': 'CTO',
  'HR Director': 'HRD',
  'Engineering Department Manager': 'EM',
  'Engineering Team Lead': 'TL',
  'Product Manager': 'PM',
  'Software Engineer': 'SWE',
  'HR Specialist': 'HR',
}

const jobTitleSeniority: Record<string, number> = {
  'Chief Technology Officer': 90,
  'HR Director': 80,
  'Engineering Department Manager': 75,
  'Product Manager': 65,
  'Engineering Team Lead': 60,
  'Software Engineer': 40,
  'HR Specialist': 40,
}

function getEmployeeSeniority(user: User, departmentHeadIds: Set<string>): number {
  if (user.roleIds.includes(roleIds.ceo)) return 100
  return jobTitleSeniority[user.jobTitle] ??
    (departmentHeadIds.has(user.id) ? 75 :
      user.roleIds.includes(roleIds.manager) || /manager|director|lead/i.test(user.jobTitle) ? 60 : 40)
}

export function CompanyLandingPage() {
  const { t, content, locale } = useTranslation()
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const users = useDirectoryStore((state) => state.users)
  const departments = useDirectoryStore((state) => state.departments)
  const departmentHeadIds = useMemo(
    () => new Set(departments.flatMap((department) => department.headUserId ? [department.headUserId] : [])),
    [departments],
  )
  const departmentsById = useMemo(
    () => new Map(departments.map((department) => [department.id, department.name] as const)),
    [departments],
  )
  const employees = useMemo(
    () =>
      users
      .filter((user) =>
        user.publicProfileVisible === true &&
        user.isActive &&
        (!user.approvalStatus || user.approvalStatus === 'APPROVED') &&
        (!user.registrationStage || user.registrationStage === 'APPROVED'),
      )
      .toSorted((left, right) => {
        const seniorityDifference = getEmployeeSeniority(right, departmentHeadIds) - getEmployeeSeniority(left, departmentHeadIds)
        if (seniorityDifference !== 0) return seniorityDifference
        return new Intl.Collator(locale).compare(content(left.fullName), content(right.fullName))
      })
      .map((user) => ({
        id: user.id,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        avatarUrl: user.avatarUrl,
        departmentName: departmentsById.get(user.departmentId),
        jobTitleCode: jobTitleCodes[user.jobTitle] ?? null,
        profile: user.profile,
      })),
    [users, departmentsById, departmentHeadIds, content, locale],
  )
  const [selectedEmployee, setSelectedEmployee] = useState<LandingEmployee | null>(null)

  if (isInitializing) {
    return <div className="grid min-h-svh place-items-center"><Spinner size="lg" label={t('requests.loading')} /></div>
  }

  return (
    <main className="min-h-svh overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="company-hero-backdrop public-theme relative isolate overflow-hidden">
      <ScrollProgress />
      <NetworkBackground />
      <div aria-hidden="true" className="landing-aurora pointer-events-none absolute -start-24 top-10 size-96 rounded-full bg-teal-400/25 blur-3xl" />
      <div aria-hidden="true" className="landing-aurora landing-aurora-b pointer-events-none absolute -end-16 bottom-0 size-[28rem] rounded-full bg-blue-500/25 blur-3xl" />

      <header className="landing-header relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link to={ROUTES.COMPANY} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
          <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-teal-100 shadow-sm">
            <FolderKanban size={20} aria-hidden="true" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight">Masar</span>
          </div>
        </Link>
        <nav aria-label={t('company.navigation')} className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:px-4">
            <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
            {t('gateway.backToGateway')}
          </Link>
        </nav>
      </header>

      <section aria-labelledby="company-heading" className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="relative z-10">
          <p style={{ '--rise-delay': '150ms' } as React.CSSProperties} className="landing-rise mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200/25 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-100 shadow-sm backdrop-blur">
            <Sparkles size={14} aria-hidden="true" />
            {t('company.eyebrow')}
          </p>
          <h1 id="company-heading" style={{ '--rise-delay': '300ms' } as React.CSSProperties} className="landing-rise max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t('company.title')}
          </h1>
          <p style={{ '--rise-delay': '480ms' } as React.CSSProperties} className="landing-rise mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            {t('company.description')}
          </p>
          <div style={{ '--rise-delay': '640ms' } as React.CSSProperties} className="landing-rise mt-8 flex flex-wrap items-center gap-3">
            <a href="#company-team" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-teal-200/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b2d46]">
              {t('company.meetTeam')}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <div style={{ '--rise-delay': '800ms' } as React.CSSProperties} className="landing-rise mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300">
            {[t('company.pointOne'), t('company.pointTwo'), t('company.pointThree')].map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-teal-300" aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div style={{ '--rise-delay': '500ms' } as React.CSSProperties} className="landing-rise relative mx-auto w-full max-w-xl" aria-label={t('company.visualLabel')}>
          <div aria-hidden="true" className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal-300/20 via-blue-300/10 to-teal-100/10 blur-2xl" />
          <div className="landing-float relative min-h-[330px] overflow-hidden rounded-[2rem] border border-white bg-[linear-gradient(145deg,#0b2d46_0%,#123b5d_55%,#0f625b_100%)] p-5 shadow-[0_28px_80px_-40px_rgba(18,59,93,0.65)] sm:min-h-[410px] sm:p-8">
            <div aria-hidden="true" className="absolute -end-16 -top-20 size-64 rounded-full border border-white/10 motion-safe:animate-[spin_36s_linear_infinite] motion-reduce:animate-none" />
            <div aria-hidden="true" className="absolute -end-8 -top-12 size-48 rounded-full border border-dashed border-teal-200/20 motion-safe:animate-[spin_28s_linear_infinite_reverse] motion-reduce:animate-none" />
            <div aria-hidden="true" className="absolute -bottom-24 -start-16 size-72 rounded-full bg-teal-400/10 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-teal-100">{t('company.visualLabel')}</span>
              <span className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-teal-100"><GitBranch size={18} aria-hidden="true" /></span>
            </div>
            <div className="relative mt-9 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:mt-12 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-teal-300 text-[#0b2d46]"><Workflow size={22} aria-hidden="true" /></span>
                <div>
                  <p className="text-sm font-bold text-white">{t('company.flowTitle')}</p>
                  <p className="mt-1 text-xs text-slate-300">{t('company.flowSubtitle')}</p>
                </div>
              </div>
              <div className="company-flow-steps relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                <span aria-hidden="true" className="company-flow-track" />
                {[t('company.flowStepOne'), t('company.flowStepTwo'), t('company.flowStepThree')].map((step, index) => (
                  <div key={step} className={`company-flow-step company-flow-step-${index} relative z-[1] rounded-xl border border-white/10 bg-slate-950/20 p-2.5 text-center sm:p-3`}>
                    <span className={`mx-auto mb-2 flex size-7 items-center justify-center rounded-full text-xs font-bold ${index === 1 ? 'bg-teal-300 text-[#0b2d46] motion-safe:animate-pulse motion-reduce:animate-none' : 'bg-white/10 text-teal-100'}`}>{index + 1}</span>
                    <span className="block text-[10px] font-semibold leading-4 text-slate-100 sm:text-xs">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-white">
                <span className="flex size-8 items-center justify-center rounded-lg bg-teal-300/15 text-teal-100"><CircleUserRound size={17} aria-hidden="true" /></span>
                {t('company.visualPeople')}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-white">
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-300/15 text-blue-100"><Check size={17} aria-hidden="true" /></span>
                {t('company.visualProgress')}
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      <section aria-labelledby="company-capabilities" className="border-y border-slate-200/80 bg-white/80">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('company.capabilitiesEyebrow')}</p>
            <h2 id="company-capabilities" className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t('company.capabilitiesTitle')}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{t('company.capabilitiesDescription')}</p>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {capabilityCards.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} as="article" delay={index * 120} variant="zoom" className="landing-capability rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-200 sm:p-6">
                <span className="landing-capability-icon flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon size={21} aria-hidden="true" /></span>
                <h3 className="mt-4 text-base font-bold text-slate-900">{t(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(description)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="company-team" aria-labelledby="company-team-heading" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{t('company.teamEyebrow')}</p>
            <h2 id="company-team-heading" className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{t('company.teamTitle')}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{t('company.teamDescription')}</p>
          </Reveal>
        </div>
        {employees.length > 0 ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map((employee, index) => (
              <li
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className="company-team-card group cursor-pointer transition hover:-translate-y-1 hover:shadow-md"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedEmployee(employee); }}
                aria-label={`${content(employee.fullName)} - ${t('profile.viewProfile')}`}
              >
                <div className="company-team-card-banner">
                  <span className="relative z-10 font-mono text-[10px] font-bold tracking-[0.16em] text-white/90">
                    MASAR / {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="relative z-10 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/90 backdrop-blur">
                    {t('company.teamProfile')}
                  </span>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-end justify-between">
                    <Avatar
                      name={content(employee.fullName)}
                      src={employee.avatarUrl ?? undefined}
                      size="lg"
                      className="company-team-avatar size-16 rounded-2xl"
                    />
                    <CircleUserRound className="mb-2 text-blue-500" size={19} aria-hidden="true" />
                  </div>
                  <span className="mt-3 block min-w-0">
                    <span className="block truncate text-base font-bold tracking-tight text-slate-900">{content(employee.fullName)}</span>
                    <span
                      data-testid="employee-job-title"
                      className={`mt-1 block min-w-0 truncate text-sm font-medium text-slate-600 ${locale === 'en' && employee.jobTitleCode ? 'font-mono tracking-wide text-blue-700 dark:text-blue-300' : ''}`}
                    >
                      {locale === 'en' && employee.jobTitleCode ? employee.jobTitleCode : content(employee.jobTitle)}
                    </span>
                    {getLocalizedProfile(employee.profile, locale).bio ? (
                      <span data-testid="employee-bio" className="mt-3 line-clamp-3 block text-sm leading-6 text-slate-600">
                        {content(getLocalizedProfile(employee.profile, locale).bio)}
                      </span>
                    ) : null}
                    {employee.departmentName ? (
                      <span className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 dark:border-slate-300 dark:bg-slate-100 dark:text-teal-300">
                        <span className="size-1.5 shrink-0 rounded-full bg-teal-500 dark:bg-teal-300" aria-hidden="true" />
                        <span className="truncate">{content(employee.departmentName)}</span>
                      </span>
                    ) : null}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600">{t('company.teamEmpty')}</p>
        )}
      </section>


      {/* Masar and Codiksa overview: keep one external Codiksa action */}
      <section aria-labelledby="codiksa-ecosystem-heading" className="border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8 lg:px-10">
          <div className="max-w-xl text-center sm:text-start">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex size-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                {t('company.codiksaEyebrow')}
              </p>
            </div>
            <h3 id="codiksa-ecosystem-heading" className="mt-2 text-lg font-bold text-slate-900">
              {t('company.codiksaTitle')}
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              {t('company.codiksaDescription')}
            </p>
          </div>
          <a
            href="https://codiksa-theta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-bold text-blue-800 shadow-sm transition hover:bg-blue-100 hover:shadow"
          >
            <span>{t('company.codiksaCta')}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-slate-500 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Masar</span>
            <span>•</span>
            <span>{t('company.footer')}</span>
          </div>

        </div>
      </footer>

      {selectedEmployee ? <EmployeeProfileModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} /> : null}
    </main>
  )
}
