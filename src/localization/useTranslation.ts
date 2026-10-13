import { useLocaleStore } from '@/store/localeStore'
import { translations } from './translations'
import { getContentTranslationKey } from './translations'
import type { TranslationKey } from './translations'

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  return {
    locale,
    t: (key: TranslationKey) => translations[locale][key],
    content: (value: string) => {
      const key = getContentTranslationKey(value)
      if (locale !== 'ar') return value
      if (key) return translations.ar[key]
      const approvalStep = value.match(/^Approval step (\d+)$/)
      if (approvalStep) {
        const stepNumber = new Intl.NumberFormat('ar-EG').format(Number(approvalStep[1]))
        return `${translations.ar['admin.approvalStep']} ${stepNumber}`
      }
      return value
    },
  }
}
