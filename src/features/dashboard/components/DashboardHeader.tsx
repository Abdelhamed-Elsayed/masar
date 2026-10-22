import { ArrowUpRight, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/authStore'
import { focusRing } from '@/components/ui/styles'
import { useTranslation } from '@/localization/useTranslation'

export function DashboardHeader() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { t, locale, content } = useTranslation()

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-blue-700">{t('dashboard.workspace')}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {t('dashboard.welcome')}{currentUser ? `${locale === 'ar' ? '، ' : ', '}${content(currentUser.firstName)}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('dashboard.description')}</p>
      </div>
      <Link
        to={ROUTES.REQUESTS_NEW}
        className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 ${focusRing}`}
      >
        <Plus aria-hidden="true" className="size-4" />
        {t('dashboard.newRequest')}
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </header>
  )
}
