import { ArrowRight, Check, LogIn, UserRoundPlus, Workflow } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from '@/localization/useTranslation'

export function WelcomePage() {
  const { t } = useTranslation()
  const primaryAction = ROUTES.LOGIN
  const primaryLabel = t('welcome.signIn')
  const primaryDescription = t('welcome.continue')
  return (
    <section className="w-full" aria-labelledby="welcome-heading">
      <div className="mb-8 sm:mb-10">
        <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-[#123b5d] ring-1 ring-teal-100 sm:size-14">
          <Workflow size={23} aria-hidden="true" />
        </span>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{t('welcome.eyebrow')}</p>
        <h1 id="welcome-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t('welcome.title')}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
          {t('welcome.description')}
        </p>
      </div>
      <div className="mb-7 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {[[ '01', t('welcome.capture'), t('welcome.captureDescription') ], ['02', t('welcome.route'), t('welcome.routeDescription')], ['03', t('welcome.track'), t('welcome.trackDescription')]].map(([step, title, text]) => (
          <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 sm:p-4">
            <span className="text-[11px] font-bold text-teal-700">{step}</span>
            <p className="mt-1 text-sm font-bold text-slate-800">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link to={primaryAction} className="group flex min-h-24 items-center gap-3 rounded-2xl bg-[#123b5d] p-4 text-white shadow-[0_14px_30px_-18px_rgba(18,59,93,0.75)] transition-all hover:-translate-y-0.5 hover:bg-[#0b2d46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><LogIn size={20} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block text-base font-bold">{primaryLabel}</span><span className="mt-1 block text-xs text-slate-200">{primaryDescription}</span></span>
          <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
        </Link>
        <Link to={ROUTES.REGISTER} className="group flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><UserRoundPlus size={20} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1"><span className="block text-base font-bold text-slate-900">{t('welcome.requestAccess')}</span><span className="mt-1 block text-xs text-slate-500">{t('welcome.join')}</span></span>
          <ArrowRight size={18} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
        {[t('auth.structuredRequests'), t('auth.clearApprovals'), t('auth.sharedVisibility')].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><Check size={13} className="text-teal-700" aria-hidden="true" />{item}</span>)}
      </div>
    </section>
  )
}
