import { Languages } from 'lucide-react'
import { useLocaleStore } from '@/store/localeStore'
import { useTranslation } from '@/localization/useTranslation'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t('language.switch')}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
    >
      <Languages size={16} aria-hidden="true" />
      {t('language.name')}
    </button>
  )
}
