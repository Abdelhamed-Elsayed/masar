import { Suspense } from 'react'
import { ArrowLeft, Check, FolderKanban, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { Spinner } from '@/components/ui'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useTranslation } from '@/localization/useTranslation'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

export function AuthLayout() {
  const { t } = useTranslation()
  return (
    <main className="min-h-svh overflow-x-hidden bg-slate-50 p-0 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto grid min-h-svh max-w-7xl overflow-hidden border border-slate-200/80 bg-white shadow-[0_28px_90px_-52px_rgba(18,59,93,0.45)] sm:min-h-[calc(100svh-2rem)] sm:rounded-3xl md:min-h-[calc(100svh-3rem)] lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="auth-aside relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#0b2d46_0%,#123b5d_52%,#0f625b_100%)] p-10 text-white lg:flex xl:p-14">
          <div className="pointer-events-none absolute -bottom-28 -end-24 size-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-14 -end-10 size-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -end-8 top-1/3 size-40 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-sm">
              <FolderKanban size={22} aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight">Masar</span>
          </div>
          <div className="relative max-w-lg">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">{t('auth.tagline')}</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">{t('auth.headline')}</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">{t('auth.description')}</p>
            <ul className="mt-8 grid gap-3 text-sm text-slate-200">
              {[t('auth.structuredRequests'), t('auth.clearApprovals'), t('auth.sharedVisibility')].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-teal-200"><Check size={14} aria-hidden="true" /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-slate-300">
            <ShieldCheck size={18} className="text-teal-200" aria-hidden="true" />
            {t('auth.teamwork')}
          </div>
        </aside>

        <section className="relative flex min-w-0 items-center justify-center overflow-hidden bg-white px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 xl:px-16">
          <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-teal-50 sm:size-72" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full border border-teal-100 sm:size-80" />
          <div className="relative w-full max-w-md">
            <Link to={ROUTES.HOME} className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
              {t('auth.backToHome')}
            </Link>
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#123b5d] text-white shadow-sm"><FolderKanban size={19} aria-hidden="true" /></span>
                <span>Masar</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>
            <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3 lg:hidden">
              {[['01', t('auth.request')], ['02', t('auth.review')], ['03', t('auth.decision')]].map(([step, label]) => (
                <div key={step} className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 sm:px-3">
                  <div className="text-[10px] font-bold text-teal-700 sm:text-[11px]">{step}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-slate-600 sm:text-[11px]">{label}</div>
                </div>
              ))}
            </div>
            <div className="mb-5 hidden justify-end lg:flex">
              <div className="flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </div>
            <Suspense fallback={<div className="grid min-h-48 place-items-center"><Spinner label="Loading page" /></div>}>
              <Outlet />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  )
}
