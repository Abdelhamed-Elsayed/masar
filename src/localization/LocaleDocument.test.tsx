import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { useLocaleStore } from '@/store/localeStore'
import { LocaleDocument } from './LocaleDocument'
import { translations } from './translations'
import { useTranslation } from './useTranslation'

function ContentTranslationProbe() {
  const { content } = useTranslation()
  return <output>{content('Approval step 12')}</output>
}

describe('language switching', () => {
  beforeEach(() => {
    localStorage.removeItem('masar-locale')
    useLocaleStore.setState({ locale: 'en' })
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  })

  it('provides a translation for every key in both languages', () => {
    expect(Object.keys(translations.ar).sort()).toEqual(Object.keys(translations.en).sort())
  })

  it('switches document language and direction and persists the choice', () => {
    render(
      <>
        <LocaleDocument />
        <LanguageSwitcher />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Switch language to Arabic' }))

    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.title).toBe(translations.ar['page.title'])
    expect(screen.getByRole('button', { name: 'تغيير اللغة إلى الإنجليزية' })).toHaveTextContent('English')
    expect(JSON.parse(localStorage.getItem('masar-locale') ?? '{}')).toMatchObject({ state: { locale: 'ar' } })
  })

  it('switches back to English and left-to-right direction', () => {
    useLocaleStore.setState({ locale: 'ar' })
    render(
      <>
        <LocaleDocument />
        <LanguageSwitcher />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'تغيير اللغة إلى الإنجليزية' }))

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.title).toBe(translations.en['page.title'])
    expect(screen.getByRole('button', { name: 'Switch language to Arabic' })).toHaveTextContent('العربية')
  })

  it('localizes generated workflow step names without changing stored values', () => {
    useLocaleStore.setState({ locale: 'ar' })
    render(<ContentTranslationProbe />)

    expect(screen.getByText('خطوة موافقة ١٢')).toBeInTheDocument()
  })
})
