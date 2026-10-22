import { useCallback } from 'react'
import { useLocaleStore } from '@/store/localeStore'
import { translations } from './translations'
import { getContentTranslationKey } from './translations'
import type { TranslationKey } from './translations'

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  const content = useCallback((value: string) => {
    if (!value || typeof value !== 'string') return ''
    const key = getContentTranslationKey(value)
    if (key && translations[locale]?.[key]) return translations[locale][key]
    const approvalStep = value.match(/^Approval step (\d+)$/)
    if (approvalStep && locale === 'ar') {
      const stepNumber = new Intl.NumberFormat('ar-EG').format(Number(approvalStep[1]))
      return `${translations.ar['admin.approvalStep']} ${stepNumber}`
    }
    const arStep = value.match(/خطوة الاعتماد\s*([٠-٩\d]+)/)
    if (arStep && locale === 'en') {
      const stepNumber = arStep[1].replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      return `Approval step ${stepNumber}`
    }
    return value
  }, [locale])

  return {
    locale,
    t: (key: TranslationKey) => translations[locale][key],
    content,
  }
}
