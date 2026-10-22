import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeft, ArrowRight, Building2, FolderKanban, LogIn, UserRoundPlus, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'
import { NetworkBackground } from '@/components/motion/NetworkBackground'

type Step = 'choose' | 'employee'

const delay = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties

/**
 * Animated entrance. Visitors say who they are:
 *  - Guest    → company (introduction) page, no sign-in controls there.
 *  - Employee → sign in or register.
 */
export function GatewayPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('choose')

  return (
    <main className="public-theme relative isolate flex min-h-svh flex-col overflow-hidden">
      <NetworkBackground />
      <div aria-hidden="true" className="landing-aurora pointer-events-none absolute -start-24 top-10 size-96 rounded-full blur-3xl" />
      <div aria-hidden="true" className="landing-aurora landing-aurora-b pointer-events-none absolute -end-16 bottom-0 size-[28rem] rounded-full blur-3xl" />

      <header className="landing-header relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="gateway-logo public-card relative flex size-11 items-center justify-center rounded-xl public-brand-sub">
            <FolderKanban size={22} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight"><span className="text-lg font-bold tracking-tight">Masar</span><span className="public-brand-sub text-[10px] font-semibold">by Codiksa</span></span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </header>

      <section aria-labelledby="gateway-heading" className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 text-center sm:px-8">
        {step === 'choose' ? (
          <div key="choose" className="w-full">
            <p style={delay(100)} className="landing-rise public-eyebrow mb-5 inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur">
              {t('gateway.eyebrow')}
            </p>
            <h1 id="gateway-heading" style={delay(250)} className="landing-rise text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {t('gateway.title')}
            </h1>
            <p style={delay(420)} className="landing-rise public-muted mx-auto mt-5 max-w-xl text-base leading-8 sm:text-lg">
              {t('gateway.subtitle')}
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
              <button
                type="button"
                style={delay(600)}
                onClick={() => setStep('employee')}
                className="landing-rise gateway-card public-card group flex flex-col items-center gap-3 rounded-3xl p-7 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                <span className="gateway-card-icon public-icon-accent flex size-16 items-center justify-center rounded-2xl"><UsersRound size={30} aria-hidden="true" /></span>
                <span className="text-xl font-bold">{t('gateway.employee')}</span>
                <span className="public-muted text-sm">{t('gateway.employeeHint')}</span>
              </button>
              <button
                type="button"
                style={delay(750)}
                onClick={() => navigate(ROUTES.COMPANY)}
                className="landing-rise gateway-card public-card group flex flex-col items-center gap-3 rounded-3xl p-7 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                <span className="gateway-card-icon public-icon-soft flex size-16 items-center justify-center rounded-2xl"><Building2 size={30} aria-hidden="true" /></span>
                <span className="text-xl font-bold">{t('gateway.guest')}</span>
                <span className="public-muted text-sm">{t('gateway.guestHint')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div key="employee" className="gateway-panel w-full">
            <h1 id="gateway-heading" className="text-3xl font-bold tracking-tight sm:text-5xl">{t('gateway.employeeTitle')}</h1>
            <p className="public-muted mx-auto mt-4 max-w-xl text-base leading-8">{t('gateway.employeeSubtitle')}</p>

            <div className="mx-auto mt-9 grid max-w-3xl gap-4 sm:grid-cols-2">
              <Link to={ROUTES.LOGIN} style={delay(100)} className="landing-rise gateway-card public-primary flex items-center gap-4 rounded-3xl p-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-black/10"><LogIn size={24} aria-hidden="true" /></span>
                <span className="flex-1 text-lg font-bold">{t('gateway.signIn')}</span>
                <ArrowRight size={20} className="rtl:rotate-180" aria-hidden="true" />
              </Link>
              <Link to={ROUTES.REGISTER} style={delay(220)} className="landing-rise gateway-card public-card flex items-center gap-4 rounded-3xl p-6 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                <span className="public-icon-soft flex size-12 shrink-0 items-center justify-center rounded-xl"><UserRoundPlus size={24} aria-hidden="true" /></span>
                <span className="flex-1 text-lg font-bold">{t('gateway.register')}</span>
                <ArrowRight size={20} className="rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>

            <div style={delay(380)} className="landing-rise mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link to={ROUTES.COMPANY} className="public-muted rounded-lg px-4 py-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                {t('gateway.browseCompany')}
              </Link>
              <button type="button" onClick={() => setStep('choose')} className="inline-flex items-center gap-1.5 public-muted rounded-lg px-4 py-2 font-semibold hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300">
                <ArrowLeft size={15} className="rtl:rotate-180" aria-hidden="true" />
                {t('gateway.back')}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
