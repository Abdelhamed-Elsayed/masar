import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { useTranslation } from '@/localization/useTranslation'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t(isDark ? 'theme.switchToLight' : 'theme.switchToDark')}
      aria-pressed={isDark}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  )
}
