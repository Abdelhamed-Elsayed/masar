import { ArrowLeft, Check, Clock3, FolderKanban, LogIn, MailCheck } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { NetworkBackground } from '@/components/motion/NetworkBackground'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'

export interface RegistrationWaitingState {
  name: string
  email: string
}

const delay = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties

/** Shown right after a registration request is submitted, in the Masar × Codiksa public style. */
export function RegistrationWaitingPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const state = location.state as Partial<RegistrationWaitingState> | null
  if (!state?.email) return <Navigate to={ROUTES.HOME} replace />

  const steps = [
    { label: t('waiting.stepHr'), status: t('waiting.statusNow'), active: true },
    { label: t('waiting.stepDepartment'), status: t('waiting.statusNext'), active: false },
    { label: t('waiting.stepCeo'), status: t('waiting.statusNext'), active: false },
  ]

  return (
    <main className="public-theme relative isolate flex min-h-svh flex-col overflow-hidden">
      <NetworkBackground />
      <div aria-hidden="true" className="landing-aurora pointer-events-none absolute -start-24 top-10 size-96 rounded-full blur-3xl" />
      <div aria-hidden="true" className="landing-aurora landing-aurora-b pointer-events-none absolute -end-16 bottom-0 size-[28rem] rounded-full blur-3xl" />

      <header className="landing-header relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="gateway-logo public-card public-brand-sub relative flex size-11 items-center justify-center rounded-xl">
            <FolderKanban size={22} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">Masar</span>
            <span className="public-brand-sub text-[10px] font-semibold">by Codiksa</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>

      <section aria-labelledby="waiting-heading" className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 text-center sm:px-8">
        <span style={delay(50)} className="landing-rise waiting-badge public-icon-accent relative flex size-20 items-center justify-center rounded-3xl">
          <Clock3 size={36} aria-hidden="true" />
        </span>
        <p style={delay(200)} className="landing-rise public-eyebrow mt-7 inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]">
          {t('waiting.eyebrow')}
        </p>
        <h1 id="waiting-heading" style={delay(320)} className="landing-rise mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
          {t('waiting.title')}
        </h1>
        <p style={delay(440)} className="landing-rise public-muted mt-4 max-w-xl text-base leading-8">
          {t('waiting.description')}
        </p>

        <div style={delay(560)} className="landing-rise public-card mt-8 w-full rounded-3xl p-5 text-start sm:p-6">
          <div className="flex items-start gap-3">
            <span className="public-icon-soft flex size-10 shrink-0 items-center justify-center rounded-xl"><MailCheck size={20} aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="public-muted text-xs font-semibold uppercase tracking-wider">{t('waiting.applicant')}</p>
              {state.name ? <p className="mt-0.5 font-bold">{state.name}</p> : null}
              <p className="public-muted mt-0.5 break-all text-sm" dir="ltr">{state.email}</p>
              <p className="public-muted mt-2 text-sm">{t('waiting.emailNote')}</p>
            </div>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={t('waiting.stepsLabel')}>
            {steps.map((step, index) => (
              <li key={step.label} className={`public-icon-soft relative rounded-2xl p-3.5 ${step.active ? 'waiting-step-active' : 'opacity-75'}`}>
                <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${step.active ? 'public-icon-accent' : 'public-card'}`}>
                  {step.active ? <Check size={14} aria-hidden="true" className="hidden" /> : null}
                  {index + 1}
                </span>
                <p className="mt-2 text-sm font-bold">{step.label}</p>
                <p className="public-muted mt-0.5 text-xs">{step.status}</p>
              </li>
            ))}
          </ol>
        </div>

        <div style={delay(700)} className="landing-rise mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to={ROUTES.HOME} className="public-primary gateway-card inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
            <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
            {t('auth.backToHome')}
          </Link>
          <Link to={ROUTES.LOGIN} className="public-card gateway-card inline-flex min-h-11 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
            <LogIn size={16} aria-hidden="true" />
            {t('gateway.signIn')}
          </Link>
        </div>
      </section>
    </main>
  )
}
