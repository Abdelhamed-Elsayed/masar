import { useEffect } from 'react'
import { useLocaleStore } from '@/store/localeStore'
import { translations } from './translations'

export function LocaleDocument() {
  const locale = useLocaleStore((state) => state.locale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.title = translations[locale]['page.title']
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = translations[locale]['page.description']
  }, [locale])

  return null
}
